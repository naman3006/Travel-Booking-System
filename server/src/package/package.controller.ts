import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { PackageService } from './package.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guard/role.guard';
import { Roles } from '../common/decorator/role.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import cloudinary from 'src/config/cloudinary.config'; // Assuming this is shared

@Controller('packages')
export class PackageController {
  constructor(private readonly service: PackageService) {}

  // PUBLIC
  @Get()
  findAll() {
    return this.service.findAllPackages();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Get('destination/:id')
  findByDestinationStrict(@Param('id') id: string) {
    return this.service.findByDestination(id);
  }

  // ADMIN ONLY
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() dto: CreatePackageDto) {
    return this.service.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePackageDto) {
    return this.service.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  // NEW: Package-specific image upload (admin-only)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('upload-image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadPackageImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Image required');

    const uploadStr = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

    const result = await cloudinary.uploader.upload(uploadStr, {
      folder: 'travelhub/packages',
      width: 800,
      height: 600,
      crop: 'fill',
      quality: 'auto',
    });

    return { imageUrl: result.secure_url };
  }
}
