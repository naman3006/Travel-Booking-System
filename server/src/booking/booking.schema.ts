/* eslint-disable prettier/prettier */
// src/booking/booking.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../user/user.schema';
import { Package } from '../package/package.schema';

export type BookingDocument = Booking & Document;

@Schema({ timestamps: true })
export class Booking extends Document {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  userId: Types.ObjectId; // ← Connected to User

  @Prop({ type: Types.ObjectId, ref: Package.name, required: true })
  packageId: Types.ObjectId; // ← Connected to Package

  @Prop({ required: true })
  travelersCount: number;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ default: 'pending' })
  status: string;

  @Prop({ 
    type: String, 
    enum: ['pending', 'paid', 'failed'], 
    default: 'pending' 
  })
  paymentStatus: string; // ← ADD THIS


  @Prop({ type: Types.ObjectId, ref: 'Payment' })
  paymentId?: Types.ObjectId; // ← Optional: link to Payment
  
  // @Prop({ required: true })
  // totalAmount: number;
  @Prop({ required: true, type: Number, min: 0.5 })
  totalAmount: number;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
