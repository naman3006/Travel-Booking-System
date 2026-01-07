
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../user/user.schema'; // Assuming User schema exists

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ required: true })
    message: string;

    @Prop({ enum: ['info', 'success', 'warning', 'error'], default: 'info' })
    type: string;

    @Prop({ default: false })
    isRead: boolean;

    @Prop()
    link: string; // Optional link to navigate to (e.g., /bookings/123)
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
