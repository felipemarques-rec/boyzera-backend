import { Repository } from 'typeorm';
import { Upgrade, UpgradeCategory } from '../../domain/entities/upgrade.entity';
import { UserUpgrade } from '../../domain/entities/user-upgrade.entity';
export interface UpgradeWithUserLevel {
    id: string;
    name: string;
    description: string;
    category: string;
    effectType: string;
    baseCost: string;
    baseEffect: number;
    costMultiplier: number;
    effectMultiplier: number;
    requiredLevel: number;
    maxLevel: number;
    imageUrl: string | null;
    iconName: string | null;
    sortOrder: number;
    isActive: boolean;
    userLevel: number;
    nextCost: string;
    nextEffect: number;
    canAfford?: boolean;
}
export declare class GetUpgradesUseCase {
    private upgradeRepository;
    private userUpgradeRepository;
    constructor(upgradeRepository: Repository<Upgrade>, userUpgradeRepository: Repository<UserUpgrade>);
    execute(category?: string): Promise<Upgrade[]>;
    executeWithUserData(userId: string, category?: string, userFollowers?: bigint): Promise<UpgradeWithUserLevel[]>;
    getByCategory(category: UpgradeCategory): Promise<Upgrade[]>;
    getById(id: string): Promise<Upgrade | null>;
}
