import { User } from './user.entity';
import { Mission } from './mission.entity';
export declare class UserMission {
    id: string;
    userId: string;
    user: User;
    missionId: string;
    mission: Mission;
    progress: number;
    completed: boolean;
    completedAt: Date;
    claimed: boolean;
    claimedAt: Date;
    periodStart: Date;
    periodEnd: Date;
    createdAt: Date;
    updatedAt: Date;
}
