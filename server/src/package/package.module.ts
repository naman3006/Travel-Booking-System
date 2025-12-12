/* eslint-disable prettier/prettier */
// src/package/package.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Package, PackageSchema } from './package.schema';
import { PackageService } from './package.service';
import { PackageController } from './package.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Package.name, schema: PackageSchema }])],
  controllers: [PackageController],
  providers: [PackageService],
})
export class PackageModule {}