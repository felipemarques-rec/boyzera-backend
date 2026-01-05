import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetNotificationsUseCase } from '../../use-cases/notification/get-notifications.use-case';
import { MarkAsReadUseCase } from '../../use-cases/notification/mark-as-read.use-case';

class MarkMultipleDto {
  notificationIds: string[];
}

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationController {
  constructor(
    private getNotificationsUseCase: GetNotificationsUseCase,
    private markAsReadUseCase: MarkAsReadUseCase,
  ) {}

  @Get()
  async getNotifications(
    @Request() req,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('unreadOnly') unreadOnly?: boolean,
  ) {
    return this.getNotificationsUseCase.execute(req.user.id, {
      limit: limit || 50,
      offset: offset || 0,
      unreadOnly: unreadOnly === true || unreadOnly === ('true' as any),
    });
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req) {
    const count = await this.getNotificationsUseCase.getUnreadCount(
      req.user.id,
    );
    return { count };
  }

  @Post(':id/read')
  async markAsRead(@Request() req, @Param('id') notificationId: string) {
    return this.markAsReadUseCase.execute(req.user.id, notificationId);
  }

  @Post('read-multiple')
  async markMultipleAsRead(@Request() req, @Body() dto: MarkMultipleDto) {
    const count = await this.markAsReadUseCase.markMultipleAsRead(
      req.user.id,
      dto.notificationIds,
    );
    return { markedCount: count };
  }

  @Post('read-all')
  async markAllAsRead(@Request() req) {
    const count = await this.markAsReadUseCase.markAllAsRead(req.user.id);
    return { markedCount: count };
  }
}
