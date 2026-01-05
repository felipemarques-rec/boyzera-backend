import { Repository } from 'typeorm';
import { Notification } from '../../domain/entities/notification.entity';
export interface GetNotificationsOptions {
    limit?: number;
    offset?: number;
    unreadOnly?: boolean;
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
}
export interface NotificationsResult {
    notifications: NotificationResponse[];
    total: number;
    unreadCount: number;
}
export declare class GetNotificationsUseCase {
    private notificationRepository;
    constructor(notificationRepository: Repository<Notification>);
    execute(userId: string, options?: GetNotificationsOptions): Promise<NotificationsResult>;
    getUnreadCount(userId: string): Promise<number>;
    cleanOldNotifications(daysOld?: number): Promise<number>;
}
