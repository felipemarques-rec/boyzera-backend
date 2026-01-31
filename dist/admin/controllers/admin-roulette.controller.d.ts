import { Repository } from 'typeorm';
import { RoulettePrize } from '../../domain/entities/roulette-prize.entity';
import { RouletteSpin } from '../../domain/entities/roulette-spin.entity';
export declare class AdminRouletteController {
    private prizeRepository;
    private spinRepository;
    constructor(prizeRepository: Repository<RoulettePrize>, spinRepository: Repository<RouletteSpin>);
    getPrizes(): Promise<RoulettePrize[]>;
    getPrize(id: string): Promise<RoulettePrize | null>;
    createPrize(data: Partial<RoulettePrize>): Promise<RoulettePrize>;
    updatePrize(id: string, data: Partial<RoulettePrize>): Promise<RoulettePrize | null>;
    deletePrize(id: string): Promise<{
        success: boolean;
    }>;
    getSpins(): Promise<RouletteSpin[]>;
    getStats(): Promise<{
        totalSpins: number;
        todaySpins: number;
        activePrizes: number;
    }>;
}
