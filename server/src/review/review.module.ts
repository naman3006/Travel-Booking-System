/* eslint-disable prettier/prettier */
// src/review/review.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Review, ReviewSchema } from './review.schema';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { User, UserSchema } from '../user/user.schema';
import { Destination, DestinationSchema } from '../destination/destination.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Review.name, schema: ReviewSchema },
      { name: User.name, schema: UserSchema },  // ← For population
      { name: Destination.name, schema: DestinationSchema },  // ← For population
    ]),
  ],
  controllers: [ReviewController],
  providers: [ReviewService],
  exports: [ReviewService],  // For portals if expanded
})
export class ReviewModule {}