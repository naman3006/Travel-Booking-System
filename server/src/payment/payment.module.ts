import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from './payment.schema';
import { Booking, BookingSchema } from '../booking/booking.schema';
import { User, UserSchema } from '../user/user.schema';
import { ConfigModule } from '@nestjs/config';
import { BookingModule } from 'src/booking/booking.module';

@Module({
  imports: [
    BookingModule,
    ConfigModule, // <-- ADD THIS
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: Booking.name, schema: BookingSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
