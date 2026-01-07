
import { Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Assuming JwtGuard exists

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) { }

    @Get()
    async getMyNotifications(@Req() req) {
        return this.notificationService.findAllByUser(req.user.userId);
    }

    @Patch('read-all')
    async markAllRead(@Req() req) {
        return this.notificationService.markAllRead(req.user.userId);
    }

    @Patch(':id/read')
    async markAsRead(@Req() req, @Param('id') id: string) {
        return this.notificationService.markAsRead(id, req.user.userId);
    }
}
