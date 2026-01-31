export declare enum RoulettePrizeType {
    FOLLOWERS = "FOLLOWERS",
    GEMS = "GEMS",
    ENERGY = "ENERGY",
    BOOSTER = "BOOSTER",
    COSMETIC = "COSMETIC",
    SPECIAL = "SPECIAL"
}
export declare class RoulettePrize {
    id: string;
    name: string;
    description: string;
    type: RoulettePrizeType;
    reward: {
        followers?: number;
        gems?: number;
        energy?: number;
        boosterType?: string;
        boosterDuration?: number;
        boosterMultiplier?: number;
        cosmeticId?: string;
    };
    probability: number;
    imageUrl: string;
    color: string;
    sortOrder: number;
    isActive: boolean;
    isExclusive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
