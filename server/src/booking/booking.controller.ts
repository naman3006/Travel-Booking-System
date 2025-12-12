/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// src/booking/booking.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guard/role.guard';
import { Roles } from '../common/decorator/role.decorator';
import { GetUser } from '../common/decorator/get-user.decorator';

@Controller('bookings')
export class BookingController {
  private readonly logger = new Logger(BookingController.name);

  constructor(private readonly service: BookingService) {}

  // ── USER ONLY ─────────────────────────────────────
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  @Post()
  create(@Body() dto: CreateBookingDto, @GetUser() user: any) {
    this.logger.log(`User ${user.userId} creating booking`);
    return this.service.create(user.userId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  @Get('my')
  findMy(@GetUser() user: any) {
    this.logger.log(`User ${user.userId} fetching own bookings`);
    return this.service.findByUser(user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  @Delete(':id/cancel')
  cancelOwn(@Param('id') id: string, @GetUser() user: any) {
    return this.service.removeBookings(id, user.userId);
  }

  @Roles('user')
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findOne(@Param('id') id: string, @GetUser() user: any) {
    return this.service.findOne(id, user.userId); // ← CHANGE TO `service`
  }
  // ── ADMIN ONLY ────────────────────────────────────
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  findAll() {
    this.logger.log('Admin fetching all bookings');
    return this.service.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBookingDto,
    @GetUser() user: any,
  ) {
    this.logger.log(`Admin ${user.userId} updating booking ${id}`);
    return this.service.update(id, dto, user.role);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string, @GetUser() user: any) {
    this.logger.log(`Admin ${user.userId} deleting booking ${id}`);
    return this.service.remove(id, user.role);
  }
}
