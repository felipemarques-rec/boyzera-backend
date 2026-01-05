import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TokenDistributionService } from '../../infrastructure/blockchain/token-distribution.service';
import { TonConnectService } from '../../infrastructure/blockchain/ton-connect.service';
import {
  TokenDistribution,
  DistributionType,
  DistributionStatus,
} from '../../domain/entities/token-distribution.entity';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class ClaimTokensUseCase {
  constructor(
    private tokenDistributionService: TokenDistributionService,
    private tonConnectService: TonConnectService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async claimPendingTokens(userId: string): Promise<{
    claimed: number;
    distributions: TokenDistribution[];
    failed: number;
  }> {
    // Check if user has a connected wallet
    const wallet = await this.tonConnectService.getPrimaryWallet(userId);
    if (!wallet) {
      throw new BadRequestException(
        'No wallet connected. Please connect a wallet first.',
      );
    }

    // Get pending distributions
    const distributions =
      await this.tokenDistributionService.getUserDistributions(userId);
    const pendingDistributions = distributions.filter(
      (d) => d.status === DistributionStatus.PENDING,
    );

    if (pendingDistributions.length === 0) {
      return { claimed: 0, distributions: [], failed: 0 };
    }

    let claimed = 0;
    let failed = 0;
    const processedDistributions: TokenDistribution[] = [];

    for (const distribution of pendingDistributions) {
      const result = await this.tokenDistributionService.processDistribution(
        distribution.id,
      );

      if (result.success) {
        claimed += distribution.amount;
      } else {
        failed++;
      }

      processedDistributions.push(result.distribution);
    }

    return {
      claimed,
      distributions: processedDistributions,
      failed,
    };
  }

  async exchangeGemsForTokens(
    userId: string,
    gems: number,
  ): Promise<TokenDistribution> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (gems < 100) {
      throw new BadRequestException('Minimum exchange is 100 gems');
    }

    if (user.gems < gems) {
      throw new BadRequestException('Insufficient gems');
    }

    // Check if user has a connected wallet
    const wallet = await this.tonConnectService.getPrimaryWallet(userId);
    if (!wallet) {
      throw new BadRequestException(
        'No wallet connected. Please connect a wallet first.',
      );
    }

    // Create exchange distribution
    const distribution =
      await this.tokenDistributionService.exchangeGemsForTokens(userId, gems);

    return distribution;
  }

  async getTokenBalance(userId: string): Promise<{
    confirmed: number;
    pending: number;
    total: number;
  }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const stats =
      await this.tokenDistributionService.getDistributionStats(userId);

    return {
      confirmed: user.tokensBz,
      pending: stats.pendingAmount,
      total: user.tokensBz + stats.pendingAmount,
    };
  }

  async getDistributionHistory(
    userId: string,
    limit: number = 50,
  ): Promise<TokenDistribution[]> {
    return this.tokenDistributionService.getUserDistributions(userId, limit);
  }

  async getDistributionStats(userId: string): Promise<{
    totalDistributed: number;
    pendingAmount: number;
    completedCount: number;
    pendingCount: number;
  }> {
    return this.tokenDistributionService.getDistributionStats(userId);
  }

  isBlockchainEnabled(): boolean {
    return this.tokenDistributionService.isBlockchainEnabled();
  }

  getTokenContractAddress(): string {
    return this.tokenDistributionService.getTokenContractAddress();
  }
}
