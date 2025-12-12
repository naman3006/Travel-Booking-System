/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  IsMongoId,
  IsInt,
  Min,
  Max,
  IsString,
  IsNotEmpty,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateReviewDto {
  @IsMongoId({ message: 'Invalid destination ID' })
  destinationId: string;

  @Transform(({ value }) => parseInt(value))
  @IsInt({ message: 'Rating must be an integer' })
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @IsNotEmpty()
  comment: string;
}
