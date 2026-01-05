export declare class BatchTapDto {
    taps: number;
    timestamp?: number;
    clientHash?: string;
}
export declare class TapResponseDto {
    success: boolean;
    tapsProcessed: number;
    followersEarned: string;
    totalFollowers: string;
    energy: number;
    maxEnergy: number;
    combo: number;
    comboMultiplier: number;
    levelUp?: {
        previousLevel: number;
        newLevel: number;
        rewards: {
            gems: number;
            followers: string;
        };
    };
}
