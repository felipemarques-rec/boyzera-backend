import { Repository } from 'typeorm';
import { User } from '../../domain/entities/user.entity';
import { RoulettePrize } from '../../domain/entities/roulette-prize.entity';
import { RouletteSpin } from '../../domain/entities/roulette-spin.entity';
export declare class RouletteService {
    private userRepository;
    private prizeRepository;
    private spinRepository;
    constructor(userRepository: Repository<User>, prizeRepository: Repository<RoulettePrize>, spinRepository: Repository<RouletteSpin>);
    getStatus(userId: string): Promise<{
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
    spin(userId: string): Promise<{
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
    getHistory(userId: string, limit?: number): Promise<{
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
    handleUserLogin(payload: {
        userId: string;
    }): Promise<void>;
    updateLoginStreak(userId: string): Promise<void>;
    private selectPrizeByWeight;
    private applyReward;
}
