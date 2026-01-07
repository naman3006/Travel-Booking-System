
import { Controller, Get, Patch, UseGuards, Req, UploadedFile, UseInterceptors, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserService } from './user.service';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req) {
    return this.userService.findById(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/profiles',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        return `${randomName}${extname(file.originalname)}`;
      },
    }),
  }))
  async updateProfile(@Req() req, @Body() body, @UploadedFile() file: Express.Multer.File) {
    const updateData = { ...body };
    if (file) {
      updateData.profilePicture = `/uploads/profiles/${file.filename}`;
    }
    return this.userService.update(req.user.userId, updateData);
  }
}
