import { RouletteService } from '../../infrastructure/roulette/roulette.service';
export declare class RouletteController {
    private readonly rouletteService;
    constructor(rouletteService: RouletteService);
    getStatus(req: any): Promise<{
        loginStreak: number;
        daysRequired: number;
        daysRemaining: number;
        isUnlocked: boolean;
        canSpinToday: boolean;
        lastSpinAt: Date;
    }>;
    getPrizes(): Promise<{
        id: string;
        name: string;
        description: string;
        type: import("../../domain/entities/roulette-prize.entity").RoulettePrizeType;
        imageUrl: string;
        color: string;
        isExclusive: boolean;
    }[]>;
    spin(req: any): Promise<{
        prize: {
            id: string;
            name: string;
            description: string;
            type: import("../../domain/entities/roulette-prize.entity").RoulettePrizeType;
            imageUrl: string;
            color: string;
        };
        reward: {
            followers?: number;
            gems?: number;
            energy?: number;
        };
        spinId: string;
    }>;
    getHistory(req: any, limit?: number): Promise<{
        id: string;
        prize: {
            id: string;
            name: string;
            type: import("../../domain/entities/roulette-prize.entity").RoulettePrizeType;
            imageUrl: string;
        };
        reward: {
            followers?: number;
            gems?: number;
            energy?: number;
            boosterType?: string;
        };
        loginStreakAtSpin: number;
        createdAt: Date;
    }[]>;
}
