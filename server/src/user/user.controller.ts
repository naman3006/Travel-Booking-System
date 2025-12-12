/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// src/user/user.controller.ts (expand existing)
import { Controller, Get, UseGuards, Post, Query } from '@nestjs/common';
// ... existing imports
import { PaymentService } from '../payment/payment.service';
import { BookingService } from '../booking/booking.service';
import { GetUser } from '../common/decorator/get-user.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guard/role.guard';
import { Roles } from 'src/common/decorator/role.decorator';
import { ReviewService } from 'src/review/review.service';

@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('user')
export class UserController {
  constructor(
    private paymentService: PaymentService, // ← Inject
    private bookingService: BookingService, // ← Existing
    private reviewService: ReviewService,
  ) {}

  @Get('profile')
  getProfile(@GetUser() user: any) {
    return { message: 'Welcome to User Portal', user };
  }

  @Get('bookings')
  getMyBookings(@GetUser() user: any) {
    return this.bookingService.findByUser(user.userId);
  }

  @Get('payments') // ← User's payments in portal
  getMyPayments(@GetUser() user: any) {
    // Mock: Get payments for user's bookings
    const bookings = this.bookingService.findByUser(user.userId);
    // In real: aggregate or loop to get payments per booking
    return this.paymentService
      .findAll()
      .then((payments) =>
        payments.filter((p) => p.userId._id.toString() === user.userId),
      );
  }

  @Get('reviews')
  getMyReviews(@GetUser() user: any) {
    console.log('User object:', user);

    return this.reviewService.findByUserId(user.userId);
  }
}
