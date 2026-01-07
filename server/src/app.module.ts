import { Module } from '@nestjs/common';

import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from './auth/auth.module';
import { User, UserSchema } from './user/user.schema';
import { MailModule } from './mail/mail.module';
import { DestinationModule } from './destination/destination.module';

import { PackageModule } from './package/package.module';
import { BookingModule } from './booking/booking.module';

import { ReviewModule } from './review/review.module';
import { PaymentModule } from './payment/payment.module';
import { AiModule } from './ai/ai.module';
import { EventsModule } from './events/events.module';
import { AdminModule } from './admin/admin.module';
import { ConfigModule } from '@nestjs/config';
import { NotificationModule } from './notification/notification.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    MongooseModule.forRoot(
      process.env.MONGO_URI ||
      'mongodb://localhost:27017/travel-booking-system-with-sessionstorage',
    ),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    UserModule,
    AuthModule,
    MailModule,
    DestinationModule,
    PackageModule,
    BookingModule,
    ReviewModule,
    AdminModule,
    PaymentModule,
    AiModule,
    NotificationModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
  ],
  providers: [],
  controllers: [],
})
export class AppModule { }
