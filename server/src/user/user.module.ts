import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { UserService } from './user.service';
import { PaymentModule } from 'src/payment/payment.module';
import { BookingModule } from 'src/booking/booking.module';

import { UserController } from './user.controller';
import { ReviewModule } from 'src/review/review.module';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    PaymentModule,
    BookingModule,
    ReviewModule,
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule { }
