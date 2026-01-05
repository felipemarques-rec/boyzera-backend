import { Repository } from 'typeorm';
import { Notification } from '../../domain/entities/notification.entity';
export declare class MarkAsReadUseCase {
    private notificationRepository;
    constructor(notificationRepository: Repository<Notification>);
    execute(userId: string, notificationId: string): Promise<Notification>;
    markMultipleAsRead(userId: string, notificationIds: string[]): Promise<number>;
    markAllAsRead(userId: string): Promise<number>;
}
