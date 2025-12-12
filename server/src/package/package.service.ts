/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// src/package/package.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Package } from './package.schema';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';

@Injectable()
export class PackageService {
  constructor(
    @InjectModel(Package.name) private packageModel: Model<Package>,
  ) {}

  findAllPackages() {
    return this.packageModel.find({ isActive: true }).lean();
  }
  // src/package/package.service.ts
  findAll(destinationId?: string) {
    const query = destinationId ? { destination: destinationId } : {};
    return this.packageModel.find(query).populate('destination').lean();
  }

  findById(id: string) {
    return this.packageModel
      .findById(id)
      .lean()
      .orFail(new NotFoundException('Package not found'));
  }

  async create(dto: CreatePackageDto) {
    try {
      const payload = {
        ...dto,
        destination: new Types.ObjectId(dto.destination), // ← FORCE ObjectId
        price: Number(dto.price),
      };
      return await this.packageModel.create(payload);
    } catch (err: any) {
      throw new BadRequestException(err.message ?? 'Failed to create package');
    }
  }

  async update(id: string, dto: UpdatePackageDto) {
    try {
      const payload = {
        ...dto,
        destination: dto.destination
          ? new Types.ObjectId(dto.destination)
          : undefined,
        price: dto.price ? Number(dto.price) : undefined,
      };
      const updated = await this.packageModel
        .findByIdAndUpdate(id, payload, { new: true })
        .lean();
      if (!updated) throw new NotFoundException('Package not found');
      return updated;
    } catch (err: any) {
      throw new BadRequestException(err.message ?? 'Failed to update package');
    }
  }

  async remove(id: string) {
    try {
      const deleted = await this.packageModel.findByIdAndDelete(id);
      if (!deleted) throw new NotFoundException('Package not found');
      return { message: 'Package deleted' };
    } catch (err: any) {
      throw new BadRequestException(err.message ?? 'Failed to delete package');
    }
  }

  async findByDestination(destinationId: string) {
    // Accept both string and ObjectId
    return this.packageModel
      .find({
        $or: [
          { destination: destinationId },
          { destination: new Types.ObjectId(destinationId) },
        ],
      })
      .populate('destination', 'name country imageUrl rating')
      .lean()
      .exec();
  }
}
