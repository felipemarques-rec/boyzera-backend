import { User } from './user.entity';
import { Interview } from './interview.entity';
export declare class UserInterview {
    id: string;
    userId: string;
    user: User;
    interviewId: string;
    interview: Interview;
    isCompleted: boolean;
    rewardsClaimed: {
        followers?: number;
        gems?: number;
    };
    participatedAt: Date;
    completedAt: Date;
}
