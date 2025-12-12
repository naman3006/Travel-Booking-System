import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Destination } from './destination.schema';
import { CreateDestinationDto } from './dto/create-destination.dto';
import { UpdateDestinationDto } from './dto/update-destination.dto';

@Injectable()
export class DestinationService {
  constructor(
    @InjectModel(Destination.name) private destinationModel: Model<Destination>,
  ) {}

  async findAll(): Promise<Destination[]> {
    return this.destinationModel.find().exec();
  }

  async findById(id: string): Promise<Destination> {
    const destination = await this.destinationModel.findById(id).exec();
    if (!destination) {
      throw new NotFoundException(`Destination not found with id: ${id}`);
    }
    return destination;
  }

  async create(dto: CreateDestinationDto): Promise<Destination> {
    const created = new this.destinationModel(dto);
    return created.save();
  }

  async update(id: string, dto: UpdateDestinationDto): Promise<Destination> {
    const updated = await this.destinationModel.findByIdAndUpdate(id, dto, {
      new: true,
    });
    if (!updated) {
      throw new NotFoundException(`Destination not found with id: ${id}`);
    }
    return updated;
  }

  async remove(id: string) {
    const result = await this.destinationModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`Destination not found with id: ${id}`);
    }
    return { message: 'Deleted' };
  }

  async count() {
    return this.destinationModel.countDocuments().exec();
  }
}
