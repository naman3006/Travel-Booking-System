/* eslint-disable prettier/prettier */
// src/admin/admin.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../user/user.schema';
import { Booking } from '../booking/booking.schema';
import { Destination } from '../destination/destination.schema'; // adjust path
import { Review } from 'src/review/review.schema';
import { Payment } from 'src/payment/payment.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
    @InjectModel(Destination.name) private destModel: Model<Destination>,
    @InjectModel(Review.name) private reviewModel: Model<Review>,
    @InjectModel(Payment.name) private paymentModel: Model<Payment>
  ) {}

  async getStats() {
    const [users, bookings, destinations, reviews, payments, paidPayments] = await Promise.all([
      this.userModel.countDocuments().exec(),
      this.bookingModel.countDocuments().exec(),
      this.destModel.countDocuments().exec(),
      this.reviewModel.countDocuments().exec(),
      this.paymentModel.countDocuments().exec(),
      this.paymentModel.countDocuments({ status: 'paid' }).exec(),
    ]);

    return {
      users,
      bookings,
      destinations,
      payments,
      paidPayments,
      reviews
    };
  }

  async getAllUsers() {
    return this.userModel
      .find()
      .select('fullName email role createdAt updatedAt')
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  // NEW: Fetch all reviews with population for table display
  async getReviews() {
    return this.reviewModel
      .find()
      .populate('userId', 'fullName') // Populate user name
      .populate('destinationId', 'name') // Populate destination name
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }
}