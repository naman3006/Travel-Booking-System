// src/payment/dto/verify-payment.dto.ts
import { IsString, IsOptional, IsEnum } from 'class-validator';

export class VerifyPaymentDto {
  @IsString()
  paymentId: string;

  @IsString()
  bookingId: string;

  @IsOptional()
  @IsEnum(['paid', 'failed'])
  status?: 'paid' | 'failed';

  @IsOptional()
  metadata?: Record<string, any>;
}
