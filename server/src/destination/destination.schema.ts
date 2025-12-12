import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Destination extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  country: string;

  @Prop()
  description?: string;

  @Prop()
  imageUrl?: string;

  @Prop({ min: 0, max: 5 })
  rating?: number;
}

export const DestinationSchema = SchemaFactory.createForClass(Destination);
