import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum ItemCategory {
  VEHICLE_CAR = 'vehicle_car',
  VEHICLE_MOTORCYCLE = 'vehicle_motorcycle',
  CLOTHING_SHIRT = 'clothing_shirt',
  CLOTHING_SHORTS = 'clothing_shorts',
  CLOTHING_JACKET = 'clothing_jacket',
  CLOTHING_PANTS = 'clothing_pants',
  SCENARIO = 'scenario',
}

export enum ItemRarity {
  COMMON = 'common',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

/**
 * Slots de equipamento:
 *   - VEHICLE_CAR: 1 slot (1 carro)
 *   - VEHICLE_MOTORCYCLE: 1 slot (1 moto)
 *   - CLOTHING: 2 slots (qualquer combinação de shirt/shorts/jacket/pants)
 *   - SCENARIO: 1 slot
 */
export const EQUIP_SLOT_MAP: Record<string, string> = {
  [ItemCategory.VEHICLE_CAR]: 'vehicle_car',
  [ItemCategory.VEHICLE_MOTORCYCLE]: 'vehicle_motorcycle',
  [ItemCategory.CLOTHING_SHIRT]: 'clothing',
  [ItemCategory.CLOTHING_SHORTS]: 'clothing',
  [ItemCategory.CLOTHING_JACKET]: 'clothing',
  [ItemCategory.CLOTHING_PANTS]: 'clothing',
  [ItemCategory.SCENARIO]: 'scenario',
};

export const SLOT_LIMITS: Record<string, number> = {
  vehicle_car: 1,
  vehicle_motorcycle: 1,
  clothing: 2,
  scenario: 1,
};

@Entity('game_items')
@Index(['category'])
@Index(['requiredFollowers'])
@Index(['isActive'])
export class GameItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ItemCategory,
  })
  category: ItemCategory;

  @Column({
    type: 'enum',
    enum: ItemRarity,
    default: ItemRarity.COMMON,
  })
  rarity: ItemRarity;

  @Column({ type: 'bigint', default: 0 })
  requiredFollowers: number;

  @Column({ type: 'float', default: 0 })
  engagementBonus: number;

  @Column({ type: 'float', default: 0 })
  followersPerHourBonus: number;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column({ nullable: true })
  brand: string;

  @Column({ nullable: true })
  model: string;

  @Column({ default: 0 })
  sortOrder: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
