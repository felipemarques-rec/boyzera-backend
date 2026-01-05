import { Repository } from 'typeorm';
import { Level } from '../../domain/entities/level.entity';
interface CreateLevelDto {
    value: number;
    name: string;
    requiredFollowers: string;
    maxEnergy: number;
    energyRegenRate: number;
    tapMultiplier: number;
    rewardGems?: number;
    rewardFollowers?: string;
    skinUnlock?: string;
    description?: string;
}
interface UpdateLevelDto {
    name?: string;
    requiredFollowers?: string;
    maxEnergy?: number;
    energyRegenRate?: number;
    tapMultiplier?: number;
    rewardGems?: number;
    rewardFollowers?: string;
    skinUnlock?: string;
    description?: string;
}
export declare class AdminLevelsController {
    private levelRepository;
    constructor(levelRepository: Repository<Level>);
    getLevels(): Promise<{
        data: {
            value: number;
            name: string;
            requiredFollowers: string;
            maxEnergy: number;
            energyRegenRate: number;
            tapMultiplier: number;
            rewardGems: number;
            rewardFollowers: string;
            skinUnlock: string;
            description: string;
        }[];
        total: number;
    }>;
    getLevel(value: number): Promise<{
        error: string;
        value?: undefined;
        name?: undefined;
        requiredFollowers?: undefined;
        maxEnergy?: undefined;
        energyRegenRate?: undefined;
        tapMultiplier?: undefined;
        rewardGems?: undefined;
        rewardFollowers?: undefined;
        skinUnlock?: undefined;
        description?: undefined;
    } | {
        value: number;
        name: string;
        requiredFollowers: string;
        maxEnergy: number;
        energyRegenRate: number;
        tapMultiplier: number;
        rewardGems: number;
        rewardFollowers: string;
        skinUnlock: string;
        description: string;
        error?: undefined;
    }>;
    createLevel(dto: CreateLevelDto): Promise<{
        error: string;
        success?: undefined;
        message?: undefined;
        value?: undefined;
    } | {
        success: boolean;
        message: string;
        value: number;
        error?: undefined;
    }>;
    updateLevel(value: number, dto: UpdateLevelDto): Promise<{
        error: string;
        success?: undefined;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        error?: undefined;
    }>;
    deleteLevel(value: number): Promise<{
        error: string;
        success?: undefined;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        error?: undefined;
    }>;
}
export {};
