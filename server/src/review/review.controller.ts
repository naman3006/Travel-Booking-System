/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewStatusDto } from './dto/update-review-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guard/role.guard';
import { Roles } from '../common/decorator/role.decorator';
import { GetUser } from '../common/decorator/get-user.decorator';
import { IsMongoId } from 'class-validator';

// For validating :destinationId param
class DestinationIdParam {
  @IsMongoId()
  destinationId: string;
}

// For validating :id param in update route
class ReviewIdParam {
  @IsMongoId()
  id: string;
}

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  // USER: Add a new review (Pending approval)

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  @Post()
  async create(@Body() dto: CreateReviewDto, @GetUser() user: any) {
    if (!user?.userId) throw new BadRequestException('Invalid user');
    return this.reviewService.create(user.userId, dto);
  }

  // USER: Get own reviews (Pending + Approved)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  @Get('my')
  async getMyReviews(@GetUser() user: any) {
    if (!user?.userId) throw new BadRequestException('Invalid user');
    return this.reviewService.findByUserId(user.userId);
  }

  // ADMIN: Get all reviews (For moderation)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  async getAllReviews() {
    return this.reviewService.findAll();
  }

  // ADMIN: Approve/Reject Review
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/status')
  async updateStatus(
    @Param() param: ReviewIdParam,
    @Body() dto: UpdateReviewStatusDto,
  ) {
    return this.reviewService.updateStatus(param.id, dto);
  }

  // PUBLIC: Get approved reviews by destination
  @Get('destination/:destinationId')
  async getReviewsByDestination(@Param() param: DestinationIdParam) {
    return this.reviewService.findByDestinationId(param.destinationId);
  }
}
