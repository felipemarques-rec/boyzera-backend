import { User } from './user.entity';
import { Collaboration } from './collaboration.entity';
export declare enum UserCollaborationStatus {
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED"
}
export declare class UserCollaboration {
    id: string;
    userId: string;
    user: User;
    collaborationId: string;
    collaboration: Collaboration;
    status: UserCollaborationStatus;
    completedAt: Date;
    rewardsClaimed: {
        followers?: number;
        gems?: number;
    };
    startedAt: Date;
}
