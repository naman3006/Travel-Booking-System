/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Req,
  HttpCode,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guard/role.guard';
import { Roles } from '../common/decorator/role.decorator';
import { GetUser } from '../common/decorator/get-user.decorator';
import { IsMongoId } from 'class-validator';
import { Request as ExpressRequest } from 'express';
import { BookingService } from 'src/booking/booking.service';

class BookingIdParam {
  @IsMongoId()
  bookingId: string;
}

@Controller('payments')
export class PaymentController {
  constructor(
    private readonly service: PaymentService,
    private readonly bookingService: BookingService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  @Post('initiate')
  initiate(@Body() dto: InitiatePaymentDto, @GetUser() user: any) {
    return this.service.initiate(user.userId, dto);
  }

  @Post('verify')
  verify(@Body() dto: VerifyPaymentDto) {
    return this.service.verify(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  @Get(':bookingId')
  findByBooking(@Param() param: BookingIdParam, @GetUser() user: any) {
    return this.service.findByBookingId(param.bookingId, user.userId);
  }

  @Post('webhook')
  @HttpCode(200)
  async handleStripeWebhook(@Req() req: ExpressRequest & { rawBody?: Buffer }) {
    const signature = req.headers['stripe-signature'] as string;

    if (!req.rawBody) {
      throw new BadRequestException('Missing raw body');
    }

    await this.service.handleWebhook(req.rawBody, signature);
    return { received: true };
  }
}
