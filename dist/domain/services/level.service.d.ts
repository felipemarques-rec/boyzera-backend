import { Repository } from 'typeorm';
import { Level } from '../entities/level.entity';
import { User } from '../entities/user.entity';
export interface LevelUpResult {
    leveledUp: boolean;
    previousLevel: number;
    newLevel: number;
    rewards: {
        gems: number;
        followers: bigint;
        maxEnergy: number;
        tapMultiplier: number;
        skinUnlock?: string;
    } | null;
}
export declare class LevelService {
    private levelRepository;
    constructor(levelRepository: Repository<Level>);
    getAllLevels(): Promise<Level[]>;
    getLevelByValue(value: number): Promise<Level | null>;
    calculateLevel(followers: bigint): Promise<Level>;
    getNextLevel(currentLevel: number): Promise<Level | null>;
    checkLevelUp(user: User): Promise<LevelUpResult>;
    getProgressToNextLevel(user: User): Promise<{
        current: bigint;
        required: bigint;
        percentage: number;
    }>;
}
