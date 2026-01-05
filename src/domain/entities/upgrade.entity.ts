import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';
import { bigintTransformer } from '../../shared/utils/bigint.transformer';

export enum UpgradeCategory {
  VEHICLE = 'vehicle',
  HOUSE = 'house',
  EQUIPMENT = 'equipment',
  STYLE = 'style',
  EDUCATION = 'education',
}

export enum UpgradeEffectType {
  TAP_MULTIPLIER = 'tap_multiplier',
  ENERGY_MAX = 'energy_max',
  ENERGY_REGEN = 'energy_regen',
  PASSIVE_INCOME = 'passive_income',
}

@Entity('upgrades')
@Index(['category'])
@Index(['requiredLevel'])
export class Upgrade {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({
    type: 'enum',
    enum: UpgradeCategory,
    default: UpgradeCategory.EQUIPMENT,
  })
  category: UpgradeCategory;

  @Column({
    type: 'enum',
    enum: UpgradeEffectType,
    default: UpgradeEffectType.PASSIVE_INCOME,
  })
  effectType: UpgradeEffectType;

  @Column({
    type: 'bigint',
    transformer: bigintTransformer,
  })
  baseCost: bigint;

  @Column({ type: 'float' })
  baseEffect: number;

  @Column({ type: 'float', default: 1.15 })
  costMultiplier: number;

  @Column({ type: 'float', default: 1.1 })
  effectMultiplier: number;

  @Column({ default: 1 })
  requiredLevel: number;

  @Column({ default: 100 })
  maxLevel: number;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  iconName: string;

  @Column({ default: 0 })
  sortOrder: number;

  @Column({ default: true })
  isActive: boolean;

  // Helper method to calculate cost at a specific level
  getCostAtLevel(level: number): bigint {
    if (level <= 0) return this.baseCost;
    return BigInt(
      Math.floor(Number(this.baseCost) * Math.pow(this.costMultiplier, level)),
    );
  }

  // Helper method to calculate effect at a specific level
  getEffectAtLevel(level: number): number {
    if (level <= 0) return 0;
    return this.baseEffect * Math.pow(this.effectMultiplier, level - 1);
  }
}
