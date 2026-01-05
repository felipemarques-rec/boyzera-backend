import { Repository } from 'typeorm';
import { TokenDistributionService } from '../../infrastructure/blockchain/token-distribution.service';
import { TonConnectService } from '../../infrastructure/blockchain/ton-connect.service';
import { TokenDistribution } from '../../domain/entities/token-distribution.entity';
import { User } from '../../domain/entities/user.entity';
export declare class ClaimTokensUseCase {
    private tokenDistributionService;
    private tonConnectService;
    private userRepository;
    constructor(tokenDistributionService: TokenDistributionService, tonConnectService: TonConnectService, userRepository: Repository<User>);
    claimPendingTokens(userId: string): Promise<{
        claimed: number;
        distributions: TokenDistribution[];
        failed: number;
    }>;
    exchangeGemsForTokens(userId: string, gems: number): Promise<TokenDistribution>;
    getTokenBalance(userId: string): Promise<{
        confirmed: number;
        pending: number;
        total: number;
    }>;
    getDistributionHistory(userId: string, limit?: number): Promise<TokenDistribution[]>;
    getDistributionStats(userId: string): Promise<{
        totalDistributed: number;
        pendingAmount: number;
        completedCount: number;
        pendingCount: number;
    }>;
    isBlockchainEnabled(): boolean;
    getTokenContractAddress(): string;
}
