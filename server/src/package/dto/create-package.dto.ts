import {
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreatePackageDto {
  @IsString()
  title: string;

  @IsMongoId()
  destination: string;

  @IsString()
  duration: string;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0.5)
  price: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
