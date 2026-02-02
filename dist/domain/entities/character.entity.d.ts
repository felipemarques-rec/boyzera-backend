export declare enum CharacterArea {
    SOCIAL = "SOCIAL",
    GARAGE = "GARAGE",
    CLOSET = "CLOSET",
    HOUSE = "HOUSE",
    GAME = "GAME",
    SHOP = "SHOP",
    SQUAD = "SQUAD",
    MISSIONS = "MISSIONS",
    CHALLENGES = "CHALLENGES",
    MINIGAMES = "MINIGAMES",
    ROULETTE = "ROULETTE",
    RAFFLES = "RAFFLES",
    ACHIEVEMENTS = "ACHIEVEMENTS",
    SEASONS = "SEASONS",
    SYSTEM = "SYSTEM"
}
export declare enum CharacterMood {
    HAPPY = "HAPPY",
    NEUTRAL = "NEUTRAL",
    EXCITED = "EXCITED",
    SAD = "SAD",
    ANGRY = "ANGRY",
    SURPRISED = "SURPRISED"
}
export declare class Character {
    id: string;
    name: string;
    displayName: string;
    description: string;
    avatarUrl: string;
    fullImageUrl: string;
    area: CharacterArea;
    defaultMood: CharacterMood;
    catchphrase: string;
    greetings: string[];
    customColors: {
        primary?: string;
        secondary?: string;
        accent?: string;
    };
    isActive: boolean;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
}
