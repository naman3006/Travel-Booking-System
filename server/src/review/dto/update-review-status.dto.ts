// src/review/dto/update-review-status.dto.ts
import { IsBoolean } from 'class-validator';

export class UpdateReviewStatusDto {
  @IsBoolean()
  isApproved: boolean;
}
