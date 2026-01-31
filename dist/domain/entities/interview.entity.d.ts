export declare enum InterviewType {
    TV = "TV",
    MAGAZINE = "MAGAZINE",
    ONLINE = "ONLINE",
    RADIO = "RADIO"
}
export declare class Interview {
    id: string;
    title: string;
    description: string;
    type: InterviewType;
    hostName: string;
    hostAvatar: string;
    channelName: string;
    imageUrl: string;
    followersReward: bigint;
    gemsReward: number;
    engagementChange: number;
    requiredLevel: number;
    availableFrom: Date;
    availableUntil: Date;
    isActive: boolean;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
}
