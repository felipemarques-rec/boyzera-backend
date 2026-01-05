import { GetNotificationsUseCase } from '../../use-cases/notification/get-notifications.use-case';
import { MarkAsReadUseCase } from '../../use-cases/notification/mark-as-read.use-case';
declare class MarkMultipleDto {
    notificationIds: string[];
}
export declare class NotificationController {
    private getNotificationsUseCase;
    private markAsReadUseCase;
    constructor(getNotificationsUseCase: GetNotificationsUseCase, markAsReadUseCase: MarkAsReadUseCase);
    getNotifications(req: any, limit?: number, offset?: number, unreadOnly?: boolean): Promise<import("../../use-cases/notification/get-notifications.use-case").NotificationsResult>;
    getUnreadCount(req: any): Promise<{
        count: number;
    }>;
    markAsRead(req: any, notificationId: string): Promise<import("../../domain/entities/notification.entity").Notification>;
    markMultipleAsRead(req: any, dto: MarkMultipleDto): Promise<{
        markedCount: number;
    }>;
    markAllAsRead(req: any): Promise<{
        markedCount: number;
    }>;
}
export {};
