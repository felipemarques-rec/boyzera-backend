import { Repository } from 'typeorm';
import { Notification, NotificationType } from '../../domain/entities/notification.entity';
export interface CreateNotificationDto {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    iconName?: string;
    data?: Record<string, any>;
    actionUrl?: string;
}
export declare class CreateNotificationUseCase {
    private notificationRepository;
    constructor(notificationRepository: Repository<Notification>);
    execute(dto: CreateNotificationDto): Promise<Notification>;
    createLevelUpNotification(userId: string, newLevel: number, rewards: {
        gems: number;
        followers: string;
    }): Promise<Notification>;
    createMissionCompleteNotification(userId: string, missionTitle: string, reward: any): Promise<Notification>;
    createReferralBonusNotification(userId: string, referredUsername: string, bonus: string): Promise<Notification>;
    createEnergyFullNotification(userId: string): Promise<Notification>;
    createDailyRewardNotification(userId: string, streak: number, reward: any): Promise<Notification>;
    createSystemNotification(userId: string, title: string, message: string): Promise<Notification>;
    createBulkNotification(userIds: string[], type: NotificationType, title: string, message: string, data?: Record<string, any>): Promise<Notification[]>;
}
