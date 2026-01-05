import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Notification,
  NotificationType,
} from '../../domain/entities/notification.entity';

export interface CreateNotificationDto {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  iconName?: string;
  data?: Record<string, any>;
  actionUrl?: string;
}

@Injectable()
export class CreateNotificationUseCase {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async execute(dto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationRepository.create({
      userId: dto.userId,
      type: dto.type,
      title: dto.title,
      message: dto.message,
      iconName: dto.iconName,
      data: dto.data,
      actionUrl: dto.actionUrl,
      isRead: false,
    });

    return this.notificationRepository.save(notification);
  }

  async createLevelUpNotification(
    userId: string,
    newLevel: number,
    rewards: { gems: number; followers: string },
  ): Promise<Notification> {
    return this.execute({
      userId,
      type: NotificationType.LEVEL_UP,
      title: 'Level Up!',
      message: `Parabens! Voce alcancou o nivel ${newLevel}!`,
      iconName: 'level-up',
      data: { level: newLevel, rewards },
    });
  }

  async createMissionCompleteNotification(
    userId: string,
    missionTitle: string,
    reward: any,
  ): Promise<Notification> {
    return this.execute({
      userId,
      type: NotificationType.MISSION_COMPLETE,
      title: 'Missao Concluida!',
      message: `Voce completou: ${missionTitle}`,
      iconName: 'mission-complete',
      data: { missionTitle, reward },
      actionUrl: '/missions',
    });
  }

  async createReferralBonusNotification(
    userId: string,
    referredUsername: string,
    bonus: string,
  ): Promise<Notification> {
    return this.execute({
      userId,
      type: NotificationType.REFERRAL_BONUS,
      title: 'Novo Indicado!',
      message: `${referredUsername || 'Alguem'} entrou pelo seu link! +${bonus} seguidores`,
      iconName: 'referral',
      data: { referredUsername, bonus },
      actionUrl: '/friends',
    });
  }

  async createEnergyFullNotification(userId: string): Promise<Notification> {
    return this.execute({
      userId,
      type: NotificationType.ENERGY_FULL,
      title: 'Energia Cheia!',
      message: 'Sua energia esta cheia! Hora de fazer taps!',
      iconName: 'energy',
    });
  }

  async createDailyRewardNotification(
    userId: string,
    streak: number,
    reward: any,
  ): Promise<Notification> {
    return this.execute({
      userId,
      type: NotificationType.DAILY_REWARD,
      title: 'Recompensa Diaria!',
      message: `Dia ${streak} de login consecutivo!`,
      iconName: 'daily-reward',
      data: { streak, reward },
    });
  }

  async createSystemNotification(
    userId: string,
    title: string,
    message: string,
  ): Promise<Notification> {
    return this.execute({
      userId,
      type: NotificationType.SYSTEM,
      title,
      message,
      iconName: 'system',
    });
  }

  async createBulkNotification(
    userIds: string[],
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, any>,
  ): Promise<Notification[]> {
    const notifications = userIds.map((userId) =>
      this.notificationRepository.create({
        userId,
        type,
        title,
        message,
        data,
        isRead: false,
      }),
    );

    return this.notificationRepository.save(notifications);
  }
}
