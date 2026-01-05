import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TokenDistribution, DistributionType, DistributionMetadata } from '../../domain/entities/token-distribution.entity';
import { User } from '../../domain/entities/user.entity';
import { WalletConnection } from '../../domain/entities/wallet-connection.entity';
export interface CreateDistributionParams {
    userId: string;
    type: DistributionType;
    amount: number;
    seasonId?: string;
    metadata?: DistributionMetadata;
}
export interface DistributionResult {
    distribution: TokenDistribution;
    transactionHash?: string;
    success: boolean;
    error?: string;
}
export declare class TokenDistributionService {
    private configService;
    private distributionRepository;
    private userRepository;
    private walletConnectionRepository;
    private eventEmitter;
    private readonly logger;
    private readonly tokenContractAddress;
    private readonly isEnabled;
    constructor(configService: ConfigService, distributionRepository: Repository<TokenDistribution>, userRepository: Repository<User>, walletConnectionRepository: Repository<WalletConnection>, eventEmitter: EventEmitter2);
    createDistribution(params: CreateDistributionParams): Promise<TokenDistribution>;
    processDistribution(distributionId: string): Promise<DistributionResult>;
    private sendTokens;
    retryFailedDistribution(distributionId: string): Promise<DistributionResult>;
    getPendingDistributions(): Promise<TokenDistribution[]>;
    getUserDistributions(userId: string, limit?: number): Promise<TokenDistribution[]>;
    getDistributionStats(userId: string): Promise<{
        totalDistributed: number;
        pendingAmount: number;
        completedCount: number;
        pendingCount: number;
    }>;
    createSeasonRewardDistributions(seasonId: string, rewards: Array<{
        userId: string;
        amount: number;
        rank: number;
    }>): Promise<TokenDistribution[]>;
    exchangeGemsForTokens(userId: string, gems: number, exchangeRate?: number): Promise<TokenDistribution>;
    isBlockchainEnabled(): boolean;
    getTokenContractAddress(): string;
}
