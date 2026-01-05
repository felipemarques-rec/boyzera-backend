import { CreateNotificationUseCase } from '../../use-cases/notification/create-notification.use-case';
export declare class NotificationListener {
    private createNotificationUseCase;
    constructor(createNotificationUseCase: CreateNotificationUseCase);
    handleLevelUpEvent(payload: {
        userId: string;
        previousLevel: number;
        newLevel: number;
        rewards: {
            gems: number;
            followers: bigint;
        };
    }): Promise<void>;
    handleMissionCompleteEvent(payload: {
        userId: string;
        missionId: string;
        missionTitle: string;
        reward: any;
    }): Promise<void>;
    handleReferralEvent(payload: {
        userId: string;
        referredUserId: string;
        totalReferrals: number;
    }): Promise<void>;
}
