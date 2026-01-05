import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Notification } from '../../domain/entities/notification.entity';

@Injectable()
export class MarkAsReadUseCase {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async execute(userId: string, notificationId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new BadRequestException('Notification not found');
    }

    if (notification.isRead) {
      return notification;
    }

    notification.isRead = true;
    notification.readAt = new Date();

    return this.notificationRepository.save(notification);
  }

  async markMultipleAsRead(
    userId: string,
    notificationIds: string[],
  ): Promise<number> {
    const result = await this.notificationRepository.update(
      {
        id: In(notificationIds),
        userId,
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      },
    );

    return result.affected || 0;
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.notificationRepository.update(
      {
        userId,
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      },
    );

    return result.affected || 0;
  }
}
