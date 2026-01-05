import { Repository } from 'typeorm';
import { Upgrade, UpgradeCategory, UpgradeEffectType } from '../../domain/entities/upgrade.entity';
interface CreateUpgradeDto {
    name: string;
    description: string;
    category: UpgradeCategory;
    effectType: UpgradeEffectType;
    baseCost: string;
    baseEffect: number;
    costMultiplier?: number;
    effectMultiplier?: number;
    requiredLevel?: number;
    maxLevel?: number;
    imageUrl?: string;
    iconName?: string;
    sortOrder?: number;
    isActive?: boolean;
}
interface UpdateUpgradeDto extends Partial<CreateUpgradeDto> {
}
export declare class AdminUpgradesController {
    private upgradeRepository;
    constructor(upgradeRepository: Repository<Upgrade>);
    getUpgrades(category?: UpgradeCategory, isActive?: string): Promise<{
        data: {
            baseCost: string;
            id: string;
            name: string;
            description: string;
            category: UpgradeCategory;
            effectType: UpgradeEffectType;
            baseEffect: number;
            costMultiplier: number;
            effectMultiplier: number;
            requiredLevel: number;
            maxLevel: number;
            imageUrl: string;
            iconName: string;
            sortOrder: number;
            isActive: boolean;
        }[];
        total: number;
    }>;
    getStats(): Promise<{
        total: number;
        active: number;
        inactive: number;
        byCategory: Record<string, number>;
    }>;
    getUpgrade(id: string): Promise<{
        error: string;
    } | {
        baseCost: string;
        id: string;
        name: string;
        description: string;
        category: UpgradeCategory;
        effectType: UpgradeEffectType;
        baseEffect: number;
        costMultiplier: number;
        effectMultiplier: number;
        requiredLevel: number;
        maxLevel: number;
        imageUrl: string;
        iconName: string;
        sortOrder: number;
        isActive: boolean;
        error?: undefined;
    }>;
    createUpgrade(dto: CreateUpgradeDto): Promise<{
        success: boolean;
        message: string;
        data: {
            baseCost: string;
            id: string;
            name: string;
            description: string;
            category: UpgradeCategory;
            effectType: UpgradeEffectType;
            baseEffect: number;
            costMultiplier: number;
            effectMultiplier: number;
            requiredLevel: number;
            maxLevel: number;
            imageUrl: string;
            iconName: string;
            sortOrder: number;
            isActive: boolean;
        };
    }>;
    updateUpgrade(id: string, dto: UpdateUpgradeDto): Promise<{
        error: string;
        success?: undefined;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        error?: undefined;
    }>;
    deleteUpgrade(id: string): Promise<{
        error: string;
        success?: undefined;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        error?: undefined;
    }>;
    toggleUpgrade(id: string): Promise<{
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
