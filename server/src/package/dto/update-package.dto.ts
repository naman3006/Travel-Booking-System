// src/package/dto/update-package.dto.ts   (same fields, all optional)
import { IsString, IsNumber, IsOptional, IsMongoId } from 'class-validator';

export class UpdatePackageDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  duration?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsMongoId()
  destination?: string;
}
