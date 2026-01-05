export declare enum SeasonStatus {
    UPCOMING = "upcoming",
    ACTIVE = "active",
    ENDED = "ended"
}
export interface SeasonRewardTier {
    rank: number;
    minRank?: number;
    maxRank?: number;
    gems: number;
    followers: string;
    tokensBz: number;
    title?: string;
}
export interface SeasonPrizePool {
    totalGems: number;
    totalTokensBz: number;
    tiers: SeasonRewardTier[];
}
export declare class Season {
    id: string;
    name: string;
    description: string;
    status: SeasonStatus;
    startDate: Date;
    endDate: Date;
    prizePool: SeasonPrizePool;
    seasonNumber: number;
    bannerUrl: string;
    themeColor: string;
    rewardsDistributed: boolean;
    rewardsDistributedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    isActive(): boolean;
    isUpcoming(): boolean;
    hasEnded(): boolean;
    getDaysRemaining(): number;
    getProgressPercentage(): number;
}
