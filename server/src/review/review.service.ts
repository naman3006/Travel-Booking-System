import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review } from './review.schema';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewStatusDto } from './dto/update-review-status.dto';

@Injectable()
export class ReviewService {
  constructor(@InjectModel(Review.name) private reviewModel: Model<Review>) {}

  // USER: Add review (pending approval)
  async create(userId: string, dto: CreateReviewDto) {
    if (!Types.ObjectId.isValid(dto.destinationId)) {
      throw new BadRequestException('Invalid destination ID');
    }

    const payload = {
      userId: new Types.ObjectId(userId),
      destinationId: new Types.ObjectId(dto.destinationId), // ← CAST
      rating: dto.rating,
      comment: dto.comment,
      isApproved: false,
    };

    return this.reviewModel.create(payload);
  }

  // PUBLIC: Get approved reviews
  async findByDestinationId(destinationId: string) {
    if (!Types.ObjectId.isValid(destinationId)) {
      throw new BadRequestException('Invalid destination ID');
    }

    return this.reviewModel
      .find({
        destinationId: new Types.ObjectId(destinationId),
        isApproved: true,
      })
      .populate('userId', 'fullName')
      .select('rating comment createdAt')
      .lean();
  }

  // USER: Get own reviews (all, including pending)
  async findByUserId(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    return this.reviewModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate('destinationId', 'name')
      .lean();
  }

  // ADMIN: Get all reviews for moderation
  async findAll() {
    return this.reviewModel
      .find()
      .populate('userId', 'fullName email')
      .populate('destinationId', 'name')
      .lean();
  }

  // ADMIN: Approve/Reject
  async updateStatus(id: string, dto: UpdateReviewStatusDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid review ID');
    }

    const review = await this.reviewModel
      .findByIdAndUpdate(id, { isApproved: dto.isApproved }, { new: true })
      .populate('userId', 'fullName')
      .populate('destinationId', 'name')
      .lean();

    if (!review) throw new NotFoundException('Review not found');
    return review;
  }
}
