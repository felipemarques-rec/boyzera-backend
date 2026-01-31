import { Raffle } from './raffle.entity';
import { UserRaffleTask } from './user-raffle-task.entity';
export declare enum RaffleTaskType {
    INSTAGRAM_FOLLOW = "INSTAGRAM_FOLLOW",
    INSTAGRAM_LIKE = "INSTAGRAM_LIKE",
    INSTAGRAM_COMMENT = "INSTAGRAM_COMMENT",
    TWITTER_FOLLOW = "TWITTER_FOLLOW",
    TWITTER_RETWEET = "TWITTER_RETWEET",
    TWITTER_LIKE = "TWITTER_LIKE",
    YOUTUBE_SUBSCRIBE = "YOUTUBE_SUBSCRIBE",
    YOUTUBE_LIKE = "YOUTUBE_LIKE",
    TELEGRAM_JOIN = "TELEGRAM_JOIN",
    DISCORD_JOIN = "DISCORD_JOIN",
    MANUAL_VERIFICATION = "MANUAL_VERIFICATION"
}
export declare enum RaffleTaskStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE"
}
export declare class RaffleTask {
    id: string;
    raffleId: string;
    raffle: Raffle;
    type: RaffleTaskType;
    title: string;
    description: string;
    iconUrl: string;
    targetUrl: string;
    targetUsername: string;
    targetPostId: string;
    ticketsReward: number;
    status: RaffleTaskStatus;
    sortOrder: number;
    requiresManualVerification: boolean;
    userTasks: UserRaffleTask[];
    createdAt: Date;
}
