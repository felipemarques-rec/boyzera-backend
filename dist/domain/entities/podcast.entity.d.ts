export declare enum PodcastCategory {
    ENTERTAINMENT = "ENTERTAINMENT",
    MUSIC = "MUSIC",
    LIFESTYLE = "LIFESTYLE",
    BUSINESS = "BUSINESS",
    COMEDY = "COMEDY"
}
export declare class Podcast {
    id: string;
    title: string;
    description: string;
    category: PodcastCategory;
    hostName: string;
    hostAvatar: string;
    podcastName: string;
    imageUrl: string;
    audioUrl: string;
    durationMinutes: number;
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
