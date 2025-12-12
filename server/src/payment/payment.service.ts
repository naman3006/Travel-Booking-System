/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Payment } from './payment.schema';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { Booking } from '../booking/booking.schema';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<Payment>,
    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
    private config: ConfigService,
  ) {
    // payment.service.ts
    this.stripe = new Stripe(this.config.get<string>('STRIPE_SECRET_KEY')!, {
      apiVersion: '2024-06-20' as any,
    });
  }

  async initiate(userId: string, dto: InitiatePaymentDto) {
    const booking = await this.bookingModel
      .findById(dto.bookingId)
      .populate('userId', '_id');

    if (!booking) throw new NotFoundException('Booking not found');

    if (booking.userId._id.toString() !== userId) {
      throw new ForbiddenException("Cannot pay for another user's booking");
    }

    // ENSURE totalAmount IS A NUMBER
    const amountInRupees = Number(booking.totalAmount);

    if (isNaN(amountInRupees) || amountInRupees <= 0) {
      throw new BadRequestException('Invalid booking amount');
    }

    const amountInCents = Math.round(amountInRupees * 100);

    if (amountInCents < 50) {
      throw new BadRequestException('Amount must be at least $0.50');
    }

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: { name: `Booking #${booking._id}` },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      metadata: { bookingId: dto.bookingId, userId },
      success_url: `${this.config.get('FRONTEND_URL')}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.config.get('FRONTEND_URL')}/payment/cancel`,
    });

    const payment = new this.paymentModel({
      userId: new Types.ObjectId(userId),
      bookingId: new Types.ObjectId(dto.bookingId),
      amount: amountInRupees,
      paymentId: session.id,
      gateway: 'stripe',
      status: 'pending',
    });

    await payment.save();
    return { sessionId: session.id, url: session.url };
  }

  /** -------------------------------------------------
   *  2. Webhook – Stripe calls this endpoint
   * ------------------------------------------------- */
  async handleWebhook(rawBody: Buffer, stripeSignature: string) {
    const webhookSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET')!;
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        stripeSignature,
        webhookSecret,
      );
    } catch (err) {
      throw new BadRequestException('Webhook signature verification failed.');
    }
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const payment = await this.paymentModel.findOne({
        paymentId: session.id,
      });
      if (!payment) return;

      payment.paidAt = new Date();
      await payment.save();

      // UPDATE BOOKING
      await this.bookingModel.updateOne(
        { _id: payment.bookingId },
        {
          $set: {
            paymentStatus: 'paid',
            paymentId: payment._id,
          },
        },
      );
    }
  }

  /** -------------------------------------------------
   *  3. Verify (optional – client-side polling fallback)
   * ------------------------------------------------- */
  async verify(dto: VerifyPaymentDto) {
    const payment = await this.paymentModel.findOne({
      paymentId: dto.paymentId,
    });
    if (!payment) throw new NotFoundException('Payment not found');

    // Pull latest status from Stripe
    const session = await this.stripe.checkout.sessions.retrieve(dto.paymentId);
    payment.status = session.payment_status === 'paid' ? 'paid' : 'failed';
    await payment.save();

    return payment;
  }

  // ---- Existing helpers (unchanged) -------------------------
  async findByBookingId(bookingId: string, userId?: string) {
    if (!Types.ObjectId.isValid(bookingId))
      throw new BadRequestException('Invalid booking ID');

    const query: any = { bookingId };
    if (userId) {
      const booking = await this.bookingModel
        .findById(bookingId)
        .populate('userId', '_id');
      if (!booking) throw new NotFoundException('Booking not found');
      if (booking.userId._id.toString() !== userId)
        throw new ForbiddenException("Cannot view another user's payment");
    }

    return this.paymentModel
      .find(query)
      .populate('userId', 'fullName email')
      .populate('bookingId', 'totalAmount status')
      .lean();
  }

  async findAll() {
    return this.paymentModel
      .find()
      .populate('userId', 'fullName email')
      .populate('bookingId', 'totalAmount status packageId')
      .lean();
  }
}
