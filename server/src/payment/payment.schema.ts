// src/payment/payment.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, SchemaTypes } from 'mongoose'; // Add SchemaTypes
import { User } from '../user/user.schema';
import { Booking } from '../booking/booking.schema';

export type PaymentDocument = Payment & Document;

@Schema({ timestamps: true })
export class Payment extends Document {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Booking.name, required: true })
  bookingId: Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ enum: ['pending', 'paid', 'failed'], default: 'pending' })
  status: 'pending' | 'paid' | 'failed';

  @Prop({ required: true })
  paymentId: string;
  @Prop()
  paidAt: Date;
  @Prop()
  gateway: string;

  @Prop({ type: SchemaTypes.Mixed }) // ← Fix: Use Mixed for arbitrary object
  metadata?: Record<string, any>;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
