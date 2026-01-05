export declare enum UpgradeCategory {
    VEHICLE = "vehicle",
    HOUSE = "house",
    EQUIPMENT = "equipment",
    STYLE = "style",
    EDUCATION = "education"
}
export declare enum UpgradeEffectType {
    TAP_MULTIPLIER = "tap_multiplier",
    ENERGY_MAX = "energy_max",
    ENERGY_REGEN = "energy_regen",
    PASSIVE_INCOME = "passive_income"
}
export declare class Upgrade {
    id: string;
    name: string;
    description: string;
    category: UpgradeCategory;
    effectType: UpgradeEffectType;
    baseCost: bigint;
    baseEffect: number;
    costMultiplier: number;
    effectMultiplier: number;
    requiredLevel: number;
    maxLevel: number;
    imageUrl: string;
    iconName: string;
    sortOrder: number;
    isActive: boolean;
    getCostAtLevel(level: number): bigint;
    getEffectAtLevel(level: number): number;
}
