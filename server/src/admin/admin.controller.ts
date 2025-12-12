/* eslint-disable prettier/prettier */
// src/admin/admin.controller.ts (expand existing)
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
// ... existing imports
import { PaymentService } from '../payment/payment.service';
import { BookingService } from '../booking/booking.service';
import { Roles } from 'src/common/decorator/role.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guard/role.guard';
import { ReviewService } from 'src/review/review.service';
import { UpdateReviewStatusDto } from 'src/review/dto/update-review-status.dto';
import { IsMongoId } from 'class-validator';
import { AdminService } from './admin.service';

class ReviewIdParam {
  @IsMongoId()
  id: string;
}

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(
    private paymentService: PaymentService, // ← Inject
    private bookingService: BookingService, // ← Existing
    private reviewService: ReviewService,
    private adminService: AdminService,
  ) {}

  @Get('dashboard')
  getDashboard() {
    return { message: 'Admin Portal – Full Control' };
  }

  @Get('bookings')
  getAllBookings() {
    return this.bookingService.findAll();
  }

  @Get('payments') // ← All payments in portal
  getAllPayments() {
    return this.paymentService.findAll();
  }

  @Get('reviews')
  getAllReviews() {
    return this.reviewService.findAll();
  }
  // src/admin/admin.controller.ts
  @Get('stats')
  async getStats() {
    return this.adminService.getStats();
  }
  // src/admin/admin.controller.ts
  @Get('users')
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Patch('reviews/:id/status')
  updateReviewStatus(
    @Param() param: ReviewIdParam,
    @Body() dto: UpdateReviewStatusDto,
  ) {
    return this.reviewService.updateStatus(param.id, dto);
  }
}
