/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/booking/dto/create-booking.dto.ts
import { IsMongoId, IsDateString, IsEnum, IsNumber, Min, IsISO8601, IsOptional } from 'class-validator';

export class CreateBookingDto {
  @IsMongoId()
  packageId: string; // or change to packageId if you prefer

  @IsNumber()
  travelersCount: number;

  @IsDateString({ strict: true })
  startDate: string;

  @IsDateString()
  endDate: string;

  // @IsNumber()
  // totalAmount: number;
}