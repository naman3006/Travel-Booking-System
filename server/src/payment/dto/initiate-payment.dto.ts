/* eslint-disable prettier/prettier */
// src/payment/dto/initiate-payment.dto.ts
import { IsMongoId, IsNumber, IsOptional, Min } from 'class-validator';

export class InitiatePaymentDto {
  @IsMongoId()
  bookingId: string;  // Booking to pay for

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;  // Override if needed (else from booking)
}