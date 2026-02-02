import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Notification } from '../../domain/entities/notification.entity';

export interface GetNotificationsOptions {
  limit?: number;
  offset?: number;
  unreadOnly?: boolean;
}

export interface CharacterInfo {
  id: string;
  name: string;
  displayName: string;
  avatarUrl: string | null;
  area: string;
  customColors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
}

export interface NotificationResponse {
  id: string;
  type: string;
  title: string;
  message: string;
  iconName: string | null;
  data: Record<string, any> | null;
  actionUrl: string | null;
  isRead: boolean;
  createdAt: Date;
  character?: CharacterInfo | null;
}

export interface NotificationsResult {
  notifications: NotificationResponse[];
  total: number;
  unreadCount: number;
}

@Injectable()
export class GetNotificationsUseCase {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async execute(
    userId: string,
    options: GetNotificationsOptions = {},
  ): Promise<NotificationsResult> {
    const { limit = 50, offset = 0, unreadOnly = false } = options;

    const whereCondition: any = { userId };
    if (unreadOnly) {
      whereCondition.isRead = false;
    }

    const [notifications, total] =
      await this.notificationRepository.findAndCount({
        where: whereCondition,
        relations: ['character'],
        order: { createdAt: 'DESC' },
        take: limit,
        skip: offset,
      });

    const unreadCount = await this.notificationRepository.count({
      where: { userId, isRead: false },
    });

    return {
      notifications: notifications.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        iconName: n.iconName,
        data: n.data,
        actionUrl: n.actionUrl,
        isRead: n.isRead,
        createdAt: n.createdAt,
        character: n.character
          ? {
              id: n.character.id,
              name: n.character.name,
              displayName: n.character.displayName || n.character.name,
              avatarUrl: n.character.avatarUrl,
              area: n.character.area,
              customColors: n.character.customColors,
            }
          : null,
      })),
      total,
      unreadCount,
    };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: { userId, isRead: false },
    });
  }

  async cleanOldNotifications(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.notificationRepository.delete({
      createdAt: LessThan(cutoffDate),
      isRead: true,
    });

    return result.affected || 0;
  }
}
