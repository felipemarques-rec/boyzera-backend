export declare enum MissionType {
    DAILY = "daily",
    WEEKLY = "weekly",
    ACHIEVEMENT = "achievement"
}
export declare enum MissionRequirementType {
    TAP_COUNT = "tap_count",
    FOLLOWER_COUNT = "follower_count",
    LEVEL_REACH = "level_reach",
    UPGRADE_BUY = "upgrade_buy",
    REFERRAL_COUNT = "referral_count",
    COMBO_REACH = "combo_reach",
    LOGIN_STREAK = "login_streak",
    WATCH_ADS = "watch_ads",
    CHALLENGE_WIN = "challenge_win",
    COLLAB_COMPLETE = "collab_complete"
}
export interface MissionRequirement {
    type: MissionRequirementType;
    target: number;
    upgradeCategory?: string;
}
export interface MissionReward {
    followers?: number;
    gems?: number;
    energy?: number;
    tokensBz?: number;
}
export declare class Mission {
    id: string;
    type: MissionType;
    title: string;
    description: string;
    requirement: MissionRequirement;
    reward: MissionReward;
    iconName: string;
    imageUrl: string;
    sortOrder: number;
    isActive: boolean;
    requiredLevel: number;
    createdAt: Date;
    updatedAt: Date;
}
