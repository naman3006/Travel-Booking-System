
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument } from './notification.schema';

@Injectable()
export class NotificationService {
    constructor(
        @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    ) { }

    async create(userId: string, message: string, type: string = 'info', link?: string) {
        const notification = new this.notificationModel({
            userId: new Types.ObjectId(userId),
            message,
            type,
            link,
        });
        return notification.save();
    }

    async findAllByUser(userId: string) {
        // Return sorted by newest first
        return this.notificationModel
            .find({ userId: new Types.ObjectId(userId) })
            .sort({ createdAt: -1 })
            .exec();
    }

    async markAsRead(id: string, userId: string) {
        const notification = await this.notificationModel.findOneAndUpdate(
            { _id: id, userId: new Types.ObjectId(userId) },
            { isRead: true },
            { new: true },
        );

        if (!notification) {
            throw new NotFoundException('Notification not found');
        }
        return notification;
    }

    async markAllRead(userId: string) {
        return this.notificationModel.updateMany(
            { userId: new Types.ObjectId(userId), isRead: false },
            { isRead: true },
        );
    }
}
