import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
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

@Injectable()
export class GetUpgradesUseCase {
  constructor(
    @InjectRepository(Upgrade)
    private upgradeRepository: Repository<Upgrade>,
    @InjectRepository(UserUpgrade)
    private userUpgradeRepository: Repository<UserUpgrade>,
  ) {}

  async execute(category?: string): Promise<Upgrade[]> {
    const where: FindOptionsWhere<Upgrade> = { isActive: true };

    if (
      category &&
      Object.values(UpgradeCategory).includes(category as UpgradeCategory)
    ) {
      where.category = category as UpgradeCategory;
    }

    return this.upgradeRepository.find({
      where,
      order: {
        category: 'ASC',
        sortOrder: 'ASC',
        requiredLevel: 'ASC',
      },
    });
  }

  async executeWithUserData(
    userId: string,
    category?: string,
    userFollowers?: bigint,
  ): Promise<UpgradeWithUserLevel[]> {
    const upgrades = await this.execute(category);

    // Get user's upgrade levels
    const userUpgrades = await this.userUpgradeRepository.find({
      where: { userId },
    });

    const userUpgradeMap = new Map(
      userUpgrades.map((uu) => [uu.upgradeId, uu.level]),
    );

    return upgrades.map((upgrade) => {
      const userLevel = userUpgradeMap.get(upgrade.id) || 0;
      const nextCost = upgrade.getCostAtLevel(userLevel);
      const nextEffect = upgrade.getEffectAtLevel(userLevel + 1);

      return {
        id: upgrade.id,
        name: upgrade.name,
        description: upgrade.description,
        category: upgrade.category,
        effectType: upgrade.effectType,
        baseCost: upgrade.baseCost.toString(),
        baseEffect: upgrade.baseEffect,
        costMultiplier: upgrade.costMultiplier,
        effectMultiplier: upgrade.effectMultiplier,
        requiredLevel: upgrade.requiredLevel,
        maxLevel: upgrade.maxLevel,
        imageUrl: upgrade.imageUrl,
        iconName: upgrade.iconName,
        sortOrder: upgrade.sortOrder,
        isActive: upgrade.isActive,
        userLevel,
        nextCost: nextCost.toString(),
        nextEffect,
        canAfford:
          userFollowers !== undefined ? userFollowers >= nextCost : undefined,
      };
    });
  }

  async getByCategory(category: UpgradeCategory): Promise<Upgrade[]> {
    return this.upgradeRepository.find({
      where: { category, isActive: true },
      order: { sortOrder: 'ASC', requiredLevel: 'ASC' },
    });
  }

  async getById(id: string): Promise<Upgrade | null> {
    return this.upgradeRepository.findOne({ where: { id } });
  }
}
