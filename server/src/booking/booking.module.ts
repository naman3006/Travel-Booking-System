/* eslint-disable prettier/prettier */
// src/booking/booking.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Booking, BookingSchema } from './booking.schema';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { User, UserSchema } from '../user/user.schema';
import { Package, PackageSchema } from '../package/package.schema';
import { EventsModule } from '../events/events.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Booking.name, schema: BookingSchema },
      { name: User.name, schema: UserSchema },  // ← For population
      { name: Package.name, schema: PackageSchema },  // ← For population
    ]),
    EventsModule,
    NotificationModule,
  ],
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService]
})
export class BookingModule { }