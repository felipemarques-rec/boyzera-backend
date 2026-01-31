import { User } from './user.entity';
import { Podcast } from './podcast.entity';
export declare class UserPodcast {
    id: string;
    userId: string;
    user: User;
    podcastId: string;
    podcast: Podcast;
    isCompleted: boolean;
    rewardsClaimed: {
        followers?: number;
        gems?: number;
    };
    participatedAt: Date;
    completedAt: Date;
}
