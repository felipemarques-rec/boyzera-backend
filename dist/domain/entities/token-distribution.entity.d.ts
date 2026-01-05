import { User } from './user.entity';
import { Season } from './season.entity';
export declare enum DistributionType {
    SEASON_REWARD = "season_reward",
    AIRDROP = "airdrop",
    REFERRAL_BONUS = "referral_bonus",
    ACHIEVEMENT = "achievement",
    EXCHANGE = "exchange",
    MANUAL = "manual"
}
export declare enum DistributionStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled"
}
export interface DistributionMetadata {
    seasonRank?: number;
    seasonName?: string;
    achievementId?: string;
    achievementName?: string;
    referralCount?: number;
    gemsExchanged?: number;
    reason?: string;
    adminNote?: string;
}
export declare class TokenDistribution {
    id: string;
    userId: string;
    user: User;
    type: DistributionType;
    status: DistributionStatus;
    amount: number;
    walletAddress?: string;
    transactionHash?: string;
    seasonId?: string;
    season?: Season;
    metadata?: DistributionMetadata;
    errorMessage?: string;
    retryCount: number;
    processedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    isPending(): boolean;
    isCompleted(): boolean;
    canRetry(): boolean;
    getExplorerUrl(network?: 'mainnet' | 'testnet'): string | null;
}
