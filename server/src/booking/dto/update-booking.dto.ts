// src/booking/dto/update-booking.dto.ts
import { IsEnum, IsOptional } from 'class-validator';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
}

export class UpdateBookingDto {
  // @IsOptional()
  // @IsEnum(['pending', 'confirmed', 'cancelled'])
  // @Transform(({ value }) => value.toLowerCase())
  // status?: 'pending' | 'confirmed' | 'cancelled';
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;
}
