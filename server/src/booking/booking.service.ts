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

@Injectable()
export class BookingService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @InjectModel(Package.name) private packageModel: Model<Package>,
  ) {}

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
      userId: new Types.ObjectId(userId), // FIX: Convert to ObjectId
      status: 'pending',
      paymentStatus: 'pending',
    });

    const saved = await booking.save(); // MUST AWAIT
    console.log('Booking SAVED:', saved._id); // DEBUG

    return saved.toObject(); // RETURN FULL OBJECT
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
