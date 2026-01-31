import { DataSource } from 'typeorm';
export interface LevelSeedData {
    value: number;
    name: string;
    requiredFollowers: bigint;
    maxEnergy: number;
    energyRegenRate: number;
    tapMultiplier: number;
    rewardGems: number;
    rewardFollowers: bigint;
    description?: string;
}
export declare const levelsSeedData: LevelSeedData[];
export declare function seedLevels(dataSource: DataSource): Promise<void>;
