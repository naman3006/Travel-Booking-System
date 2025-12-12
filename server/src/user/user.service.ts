/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(
    fullName: string,
    email: string,
    password: string,
    role = 'user',
  ) {
    const exists = await this.userModel.findOne({ email }).exec();
    if (exists) throw new ConflictException('Email already registered');

    const hash = await bcrypt.hash(password, 10);
    const created = new this.userModel({
      fullName,
      email,
      password: hash,
      role,
    });
    return created.save();
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string) {
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async setResetOtp(email: string, otpHash: string, expiresAt: Date) {
    return this.userModel.findOneAndUpdate(
      { email },
      { resetOtpHash: otpHash, resetOtpExpires: expiresAt },
      { new: true },
    );
  }

  async clearResetOtp(userId: string) {
    return this.userModel.findByIdAndUpdate(userId, {
      resetOtpHash: null,
      resetOtpExpires: null,
    });
  }

  async setPassword(userId: string, newPassword: string) {
    const hash = await bcrypt.hash(newPassword, 10);

    return this.userModel.findByIdAndUpdate(userId, {
      password: hash,
      resetOtpHash: null,
      resetOtpExpires: null,
    });
  }

  async validateUser(email: string, pass: string) {
    const user = await this.findByEmail(email);
    if (!user) return null;

    const match = await bcrypt.compare(pass, user.password);
    if (!match) return null;

    const { password, resetOtpHash, resetOtpExpires, ...rest } =
      user.toObject();

    return rest;
  }

  // src/user/user.service.ts
  async count() {
    return this.userModel.countDocuments().exec();
  }
}
