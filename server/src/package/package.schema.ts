// src/package/package.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Package extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ type: Types.ObjectId, ref: 'Destination', required: true })
  destination: Types.ObjectId; // ← NEW: Links to Destination

  @Prop({ required: true })
  duration: string; // e.g., "5 days"

  @Prop({ required: true, min: 50 })
  price: number;

  @Prop()
  description?: string;

  @Prop()
  imageUrl?: string;

  @Prop({ min: 0, max: 5 })
  rating?: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const PackageSchema = SchemaFactory.createForClass(Package);
