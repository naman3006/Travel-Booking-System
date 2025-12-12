/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from '../user/user.schema';
import { MailService } from '../mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private mailService: MailService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string) {
    const user = await this.userModel.findOne({ email });
    if (user && (await bcrypt.compare(pass, user.password))) {
      return user;
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  // 🔹 Register new user
  async register(dto: RegisterDto) {
    const existing = await this.userModel.findOne({ email: dto.email });
    if (existing) throw new BadRequestException('Email already registered');

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    // ✅ Allow setting dmin manually if sent in body
    const user = await this.userModel.create({
      fullName: dto.fullName,
      email: dto.email,
      password: hashedPassword,
      role: dto.role ?? 'user',
    });

    return {
      success: true,
      message: 'User registered',
      user,
    };
  }

  // 🔹 Login existing user
  async login(dto: LoginDto) {
    const user = await this.userModel.findOne({ email: dto.email });
    if (!user) throw new NotFoundException('User not found');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    // ***** PAYLOAD NOW CONTAINS ROLE *****
    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role, // <‑‑ crucial
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'secret123',
      expiresIn: '24h',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'refresh_secret',
      expiresIn: '30d',
    });

    user.refreshToken = await bcrypt.hash(refreshToken, 10);
    await user.save();

    return {
      success: true,
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    };
  }

  // Refresh token
  async refreshTokens(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh_secret',
      });

      const user = await this.userModel.findById(decoded.sub);
      if (!user) throw new UnauthorizedException('User not found');

      if (!user.refreshToken)
        throw new UnauthorizedException('No refresh token stored');

      const match = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!match) throw new UnauthorizedException('Invalid refresh token');

      const payload = { sub: user._id, email: user.email };

      const newAccessToken = this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET || 'secret123',
        expiresIn: '24h',
      });

      const newRefreshToken = this.jwtService.sign(payload, {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh_secret',
        expiresIn: '7d',
      });

      user.refreshToken = await bcrypt.hash(newRefreshToken, 10);
      await user.save();

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  // Logout
  async logout(userId: string) {
    await this.userModel.findByIdAndUpdate(userId, { refreshToken: null });
    return { success: true, message: 'Logged out successfully' };
  }

  // 🔹 Generate 6-digit OTP
  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async hashOtp(otp: string) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(otp, salt);
  }

  private otpExpiresDate(): Date {
    const minutes = Number(process.env.OTP_EXPIRATION_MINUTES || 15);
    return new Date(Date.now() + minutes * 60 * 1000);
  }

  async forgotPassword(email: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new NotFoundException('User not found');

    const otp = this.generateOtp();
    const otpHash = await this.hashOtp(otp);
    const expires = this.otpExpiresDate();

    user.resetOtpHash = otpHash;
    user.resetOtpExpires = expires;
    await user.save();

    const html = `
      <p>Hi ${user.fullName},</p>
      <p>Your password reset OTP is <b>${otp}</b>.</p>
      <p>It expires at <i>${expires.toLocaleString()}</i>.</p>
    `;

    const sendResult = await this.mailService.sendMail(
      email,
      'Password Reset OTP',
      html,
    );

    console.log('📧 OTP Mail Sent:', sendResult);

    return {
      success: true,
      message: 'OTP sent successfully',
      previewUrl: sendResult.previewUrl || null,
      messageId: sendResult.messageId,
    };
  }

  private async isOtpValid(plainOtp: string, hash: string) {
    return bcrypt.compare(plainOtp, hash);
  }

  // 🔹 Verify OTP
  async verifyOtp(email: string, otp: string) {
    const user = await this.userModel.findOne({ email });

    if (!user || !user.resetOtpHash || !user.resetOtpExpires)
      throw new BadRequestException('OTP not found');

    if (user.resetOtpExpires < new Date())
      throw new BadRequestException('OTP expired');

    const ok = await this.isOtpValid(otp, user.resetOtpHash);
    if (!ok) throw new BadRequestException('Invalid OTP');

    return { success: true };
  }

  // 🔹 Reset password
  async resetPassword(
    email: string,
    otp: string,
    newPassword: string,
    confirmPassword: string,
  ) {
    if (newPassword !== confirmPassword)
      throw new BadRequestException('Passwords do not match');

    const user = await this.userModel.findOne({ email });

    if (!user || !user.resetOtpHash || !user.resetOtpExpires)
      throw new BadRequestException('OTP not found');

    if (user.resetOtpExpires < new Date())
      throw new BadRequestException('OTP expired');

    const ok = await this.isOtpValid(otp, user.resetOtpHash);

    if (!ok) throw new BadRequestException('Invalid OTP');

    const salt = await bcrypt.genSalt(12);

    user.password = await bcrypt.hash(newPassword, salt);
    user.resetOtpHash = undefined;
    user.resetOtpExpires = undefined;

    await user.save();

    return { success: true, message: 'Password reset successful' };
  }
}
