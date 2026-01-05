import { User } from './user.entity';
export declare enum TransactionType {
    TAP = "tap",
    PASSIVE = "passive",
    PURCHASE = "purchase",
    REWARD = "reward",
    REFERRAL = "referral",
    TOKEN_EXCHANGE = "token_exchange",
    MISSION_REWARD = "mission_reward",
    LEVEL_UP = "level_up",
    SEASON_REWARD = "season_reward",
    UPGRADE_PURCHASE = "upgrade_purchase"
}
export declare enum CurrencyType {
    FOLLOWERS = "followers",
    GEMS = "gems",
    TOKENS_BZ = "tokens_bz"
}
export interface TransactionMetadata {
    missionId?: string;
    missionTitle?: string;
    referralId?: string;
    referredUserId?: string;
    upgradeId?: string;
    upgradeName?: string;
    levelFrom?: number;
    levelTo?: number;
    seasonId?: string;
    seasonName?: string;
    tapCount?: number;
    hoursOffline?: number;
    description?: string;
}
export declare class Transaction {
    id: string;
    userId: string;
    user: User;
    type: TransactionType;
    currency: CurrencyType;
    amount: bigint;
    balanceBefore: bigint | null;
    balanceAfter: bigint | null;
    metadata: TransactionMetadata;
    seasonId: string;
    createdAt: Date;
    isCredit(): boolean;
    isDebit(): boolean;
    getAbsoluteAmount(): bigint;
    getFormattedAmount(): string;
}
