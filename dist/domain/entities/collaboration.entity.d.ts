export declare enum CollaborationType {
    BRAND = "BRAND",
    INFLUENCER = "INFLUENCER",
    MUSIC = "MUSIC",
    EVENT = "EVENT"
}
export declare enum CollaborationStatus {
    AVAILABLE = "AVAILABLE",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    EXPIRED = "EXPIRED"
}
export declare class Collaboration {
    id: string;
    title: string;
    description: string;
    type: CollaborationType;
    brandName: string;
    brandLogo: string;
    imageUrl: string;
    followersReward: bigint;
    gemsReward: number;
    engagementBonus: number;
    requiredLevel: number;
    durationMinutes: number;
    expiresAt: Date;
    maxParticipants: number;
    currentParticipants: number;
    isActive: boolean;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
}
