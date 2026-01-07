// src/booking/booking.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Booking, BookingDocument } from './booking.schema';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Package } from '../package/package.schema';
import { EventsGateway } from '../events/events.gateway';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class BookingService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @InjectModel(Package.name) private packageModel: Model<Package>,
    private eventsGateway: EventsGateway,
    private notificationService: NotificationService,
  ) { }

  async create(userId: string, dto: CreateBookingDto) {
    const pkg = await this.packageModel.findById(dto.packageId).lean();
    if (!pkg) throw new NotFoundException('Package not found');

    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()))
      throw new BadRequestException('Invalid date format');
    if (start >= end)
      throw new BadRequestException('Start date must be before end date');

    const totalAmount = pkg.price * dto.travelersCount;

    if (totalAmount < 0.5) {
      throw new BadRequestException('Total amount must be at least $0.50');
    }

    const booking = new this.bookingModel({
      ...dto,
      totalAmount,
      userId: new Types.ObjectId(userId),
      status: 'pending',
      paymentStatus: 'pending',
    });

    const saved = await booking.save();
    console.log('Booking SAVED:', saved._id);

    // 🔔 Notify Admins
    // Let's save a success notification for the user who booked.
    await this.notificationService.create(userId, `You successfully booked ${pkg.title}!`, 'success', `/bookings/${saved._id}`);

    // 🌍 Broadcast to ALL users (Social Proof)
    this.eventsGateway.broadcastToAll('public_notification', {
      message: `🚀 Someone just booked a trip to ${pkg.title}!`,
    });

    return saved.toObject();
  }

  async findByUser(userId: string) {
    return this.bookingModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate({
        path: 'packageId',
        select: 'travelerCount title price imageUrl duration',
      })
      .lean()
      .exec();
  }

  // ADD THIS METHOD
  async findOne(id: string, userId: string) {
    const booking = await this.bookingModel
      .findOne({ _id: id, userId: new Types.ObjectId(userId) })
      .populate('packageId', 'title price imageUrl duration')
      .lean();

    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async findAll() {
    return this.bookingModel
      .find()
      .populate('userId', 'fullName email')
      .populate('packageId', 'title price imageUrl duration')
      .lean()
      .exec();
  }

  async findById(id: string) {
    return this.bookingModel
      .findById(id)
      .populate('userId', 'fullName email')
      .populate('packageId', 'title price imageUrl duration')
      .lean()
      .orFail(new NotFoundException('Booking not found'));
  }

  async update(id: string, dto: UpdateBookingDto, requesterRole: string) {
    if (requesterRole !== 'admin')
      throw new ForbiddenException('Only admins can update bookings');

    const updated = await this.bookingModel
      .findByIdAndUpdate(id, dto, { new: true })
      .populate('userId', 'fullName email')
      .populate('packageId', 'title price imageUrl duration')
      .lean();

    if (!updated) throw new NotFoundException('Booking not found');

    // 🔔 Notify User
    const userId = (updated.userId as any)._id.toString();
    this.eventsGateway.notifyUser(userId, 'booking_status', {
      message: `Your booking for ${(updated.packageId as any).title} is now: ${updated.status}`,
      status: updated.status,
    });

    // Save User Notification
    await this.notificationService.create(userId, `Your booking status updated to ${updated.status}`, 'info', `/bookings/${id}`);

    return updated;
  }
  async removeBookings(id: string, requesterId: string) {
    const booking = await this.bookingModel.findById(id).lean();
    if (!booking) throw new NotFoundException('Booking not found');

    // Only owner can cancel
    if (booking.userId.toString() !== requesterId) {
      throw new ForbiddenException('You can only cancel your own bookings');
    }

    const deleted = await this.bookingModel.findByIdAndDelete(id);

    // 🔔 Notify Admins of cancellation
    this.eventsGateway.notifyAdmins('booking_cancelled', {
      message: `❌ User ${requesterId} cancelled booking for ID ${id}`,
      bookingId: id
    });

    // NOTE: We are NOT saving admin notifications to DB here because we don't have Admin IDs.
    // In a real app we would find all admins and create a notification for each.

    return { message: 'Booking cancelled', deleted };
  }

  async remove(id: string, requesterRole: string) {
    if (requesterRole !== 'admin')
      throw new ForbiddenException('Only admins can delete bookings');

    const deleted = await this.bookingModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Booking not found');
    return { message: 'Booking cancelled' };
  }

  async count() {
    return this.bookingModel.countDocuments().exec();
  }
}
