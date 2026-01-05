export declare enum ProductType {
    GEMS = "gems",
    BOOSTER = "booster",
    SKIN = "skin",
    ENERGY_PACK = "energy_pack",
    VIP_PASS = "vip_pass",
    SPECIAL_OFFER = "special_offer"
}
export declare enum ProductCurrency {
    STARS = "stars",
    GEMS = "gems",
    FOLLOWERS = "followers",
    REAL_MONEY = "real_money"
}
export declare enum BoosterType {
    TAP_MULTIPLIER = "tap_multiplier",
    ENERGY_REGEN = "energy_regen",
    PASSIVE_INCOME = "passive_income",
    XP_BOOST = "xp_boost"
}
export interface ProductReward {
    gems?: number;
    followers?: string;
    energy?: number;
    boosterType?: BoosterType;
    boosterDurationHours?: number;
    boosterMultiplier?: number;
    skinId?: string;
    vipDays?: number;
}
export interface ProductMetadata {
    originalPrice?: number;
    discountPercent?: number;
    limitedQuantity?: number;
    purchaseLimit?: number;
    validUntil?: Date;
    featured?: boolean;
    badgeText?: string;
}
export declare class Product {
    id: string;
    name: string;
    description: string;
    type: ProductType;
    currency: ProductCurrency;
    price: number;
    reward: ProductReward;
    metadata: ProductMetadata;
    imageUrl: string;
    iconUrl: string;
    sortOrder: number;
    isActive: boolean;
    purchaseCount: number;
    createdAt: Date;
    updatedAt: Date;
    isAvailable(): boolean;
    getDisplayPrice(): string;
    hasDiscount(): boolean;
    getOriginalPrice(): number;
}
