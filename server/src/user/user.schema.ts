/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, unique:true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: String, enum: ['user', 'admin'], default: 'user' })
  role: string;

  @Prop() 
  refreshToken?: string;

  @Prop()
  resetOtpHash?: string;

  @Prop()
  resetOtpExpires?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ resetOtpExpires: 1 }, { expireAfterSeconds: 0 });

