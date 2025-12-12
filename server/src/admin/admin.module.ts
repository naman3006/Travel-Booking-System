/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { PaymentModule } from 'src/payment/payment.module';
import { BookingModule } from 'src/booking/booking.module';
import { ReviewModule } from 'src/review/review.module';
import { AdminController } from './admin.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/user/user.schema';
import { Booking, BookingSchema } from 'src/booking/booking.schema';
import {
  Destination,
  DestinationSchema,
} from 'src/destination/destination.schema';
import { Review, ReviewSchema } from 'src/review/review.schema';
import { Payment, PaymentSchema } from 'src/payment/payment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Booking.name, schema: BookingSchema },
      { name: Destination.name, schema: DestinationSchema },
      { name: Review.name, schema: ReviewSchema },
      { name: Payment.name, schema: PaymentSchema }, 

    ]),
    PaymentModule,
    BookingModule,
    ReviewModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
