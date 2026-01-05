import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum ProductType {
  GEMS = 'gems', // Premium currency
  BOOSTER = 'booster', // 2x multiplier for X hours
  SKIN = 'skin', // Character skins
  ENERGY_PACK = 'energy_pack', // Instant energy refill
  VIP_PASS = 'vip_pass', // VIP subscription
  SPECIAL_OFFER = 'special_offer', // Limited time offers
}

export enum ProductCurrency {
  STARS = 'stars', // Telegram Stars
  GEMS = 'gems', // In-game gems
  FOLLOWERS = 'followers', // In-game followers
  REAL_MONEY = 'real_money', // Fiat currency (for future)
}

export enum BoosterType {
  TAP_MULTIPLIER = 'tap_multiplier', // 2x tap rewards
  ENERGY_REGEN = 'energy_regen', // Faster energy regen
  PASSIVE_INCOME = 'passive_income', // 2x passive income
  XP_BOOST = 'xp_boost', // Faster leveling
}

export interface ProductReward {
  gems?: number;
  followers?: string; // BigInt as string
  energy?: number;
  boosterType?: BoosterType;
  boosterDurationHours?: number;
  boosterMultiplier?: number;
  skinId?: string;
  vipDays?: number;
}

export interface ProductMetadata {
  originalPrice?: number; // For showing discounts
  discountPercent?: number;
  limitedQuantity?: number;
  purchaseLimit?: number; // Per user
  validUntil?: Date;
  featured?: boolean;
  badgeText?: string; // "BEST VALUE", "POPULAR", etc.
}

@Entity('products')
@Index(['type', 'isActive'])
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ProductType,
  })
  @Index()
  type: ProductType;

  @Column({
    type: 'enum',
    enum: ProductCurrency,
  })
  currency: ProductCurrency;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  price: number;

  @Column({ type: 'jsonb' })
  reward: ProductReward;

  @Column({ type: 'jsonb', nullable: true })
  metadata: ProductMetadata;

  @Column({ type: 'varchar', nullable: true })
  imageUrl: string;

  @Column({ type: 'varchar', nullable: true })
  iconUrl: string;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @Column({ type: 'boolean', default: true })
  @Index()
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  purchaseCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods
  isAvailable(): boolean {
    if (!this.isActive) return false;

    if (this.metadata?.validUntil) {
      return new Date() < this.metadata.validUntil;
    }

    if (this.metadata?.limitedQuantity !== undefined) {
      return this.purchaseCount < this.metadata.limitedQuantity;
    }

    return true;
  }

  getDisplayPrice(): string {
    switch (this.currency) {
      case ProductCurrency.STARS:
        return `⭐ ${this.price}`;
      case ProductCurrency.GEMS:
        return `💎 ${this.price}`;
      case ProductCurrency.FOLLOWERS:
        return `👥 ${this.price}`;
      default:
        return `${this.price}`;
    }
  }

  hasDiscount(): boolean {
    return (this.metadata?.discountPercent ?? 0) > 0;
  }

  getOriginalPrice(): number {
    if (this.metadata?.originalPrice) {
      return this.metadata.originalPrice;
    }
    if (this.metadata?.discountPercent) {
      return this.price / (1 - this.metadata.discountPercent / 100);
    }
    return this.price;
  }
}
