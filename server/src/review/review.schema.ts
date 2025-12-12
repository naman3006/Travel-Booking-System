// src/review/review.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../user/user.schema';

export type ReviewDocument = Review & Document;

@Schema({ timestamps: true })
export class Review extends Document {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  userId: Types.ObjectId; // ← Connected to User

  @Prop({ type: String, ref: 'Destination', required: true })
  destinationId: string;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ required: true })
  comment: string;

  @Prop({ default: true })
  isApproved: boolean; // Admin can approve/moderate
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
