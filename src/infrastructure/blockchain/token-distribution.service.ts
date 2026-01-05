import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  TokenDistribution,
  DistributionType,
  DistributionStatus,
  DistributionMetadata,
} from '../../domain/entities/token-distribution.entity';
import { User } from '../../domain/entities/user.entity';
import {
  WalletConnection,
  WalletStatus,
} from '../../domain/entities/wallet-connection.entity';

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

@Injectable()
export class TokenDistributionService {
  private readonly logger = new Logger(TokenDistributionService.name);
  private readonly tokenContractAddress: string;
  private readonly isEnabled: boolean;

  constructor(
    private configService: ConfigService,
    @InjectRepository(TokenDistribution)
    private distributionRepository: Repository<TokenDistribution>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(WalletConnection)
    private walletConnectionRepository: Repository<WalletConnection>,
    private eventEmitter: EventEmitter2,
  ) {
    this.tokenContractAddress = this.configService.get<string>(
      'BZ_TOKEN_CONTRACT_ADDRESS',
      '',
    );
    this.isEnabled = this.configService.get<boolean>(
      'BLOCKCHAIN_ENABLED',
      false,
    );
  }

  async createDistribution(
    params: CreateDistributionParams,
  ): Promise<TokenDistribution> {
    const { userId, type, amount, seasonId, metadata } = params;

    // Get user's primary wallet
    const wallet = await this.walletConnectionRepository.findOne({
      where: { userId, status: WalletStatus.CONNECTED, isPrimary: true },
    });

    const distribution = this.distributionRepository.create({
      userId,
      type,
      status: DistributionStatus.PENDING,
      amount,
      walletAddress: wallet?.walletAddress,
      seasonId,
      metadata,
    });

    await this.distributionRepository.save(distribution);

    this.logger.log(
      `Created distribution ${distribution.id} for user ${userId}: ${amount} BZ`,
    );

    return distribution;
  }

  async processDistribution(
    distributionId: string,
  ): Promise<DistributionResult> {
    const distribution = await this.distributionRepository.findOne({
      where: { id: distributionId },
      relations: ['user'],
    });

    if (!distribution) {
      throw new Error('Distribution not found');
    }

    if (distribution.status !== DistributionStatus.PENDING) {
      throw new Error('Distribution is not pending');
    }

    if (!distribution.walletAddress) {
      // Update with error
      distribution.status = DistributionStatus.FAILED;
      distribution.errorMessage = 'No wallet connected';
      await this.distributionRepository.save(distribution);

      return {
        distribution,
        success: false,
        error: 'No wallet connected',
      };
    }

    // Update status to processing
    distribution.status = DistributionStatus.PROCESSING;
    await this.distributionRepository.save(distribution);

    try {
      // In production, this would call the TON blockchain
      // For now, we simulate the transaction
      const transactionHash = await this.sendTokens(
        distribution.walletAddress,
        distribution.amount,
      );

      // Update distribution with success
      distribution.status = DistributionStatus.COMPLETED;
      distribution.transactionHash = transactionHash;
      distribution.processedAt = new Date();
      await this.distributionRepository.save(distribution);

      // Update user's tokensBz balance
      const user = await this.userRepository.findOne({
        where: { id: distribution.userId },
      });
      if (user) {
        user.tokensBz += distribution.amount;
        await this.userRepository.save(user);
      }

      // Emit event
      this.eventEmitter.emit('token.distributed', {
        distributionId: distribution.id,
        userId: distribution.userId,
        amount: distribution.amount,
        transactionHash,
      });

      this.logger.log(
        `Distribution ${distributionId} completed: ${transactionHash}`,
      );

      return {
        distribution,
        transactionHash,
        success: true,
      };
    } catch (error) {
      // Update distribution with error
      distribution.status = DistributionStatus.FAILED;
      distribution.errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      distribution.retryCount += 1;
      await this.distributionRepository.save(distribution);

      this.logger.error(
        `Distribution ${distributionId} failed: ${distribution.errorMessage}`,
      );

      return {
        distribution,
        success: false,
        error: distribution.errorMessage,
      };
    }
  }

  private async sendTokens(
    walletAddress: string,
    amount: number,
  ): Promise<string> {
    // In production, this would:
    // 1. Create a TON transaction to transfer BZ tokens
    // 2. Sign with the distribution wallet's private key
    // 3. Send to the blockchain
    // 4. Return the transaction hash

    if (!this.isEnabled) {
      // Simulate transaction in development
      const mockHash = `0x${Buffer.from(
        `${walletAddress}:${amount}:${Date.now()}`,
      )
        .toString('hex')
        .slice(0, 64)}`;

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return mockHash;
    }

    // TODO: Implement actual TON token transfer
    // Using @ton/ton or tonweb library
    throw new Error('Blockchain integration not implemented');
  }

  async retryFailedDistribution(
    distributionId: string,
  ): Promise<DistributionResult> {
    const distribution = await this.distributionRepository.findOne({
      where: { id: distributionId },
    });

    if (!distribution) {
      throw new Error('Distribution not found');
    }

    if (!distribution.canRetry()) {
      throw new Error('Distribution cannot be retried');
    }

    // Reset to pending for retry
    distribution.status = DistributionStatus.PENDING;
    distribution.errorMessage = undefined;
    await this.distributionRepository.save(distribution);

    return this.processDistribution(distributionId);
  }

  async getPendingDistributions(): Promise<TokenDistribution[]> {
    return this.distributionRepository.find({
      where: { status: DistributionStatus.PENDING },
      order: { createdAt: 'ASC' },
    });
  }

  async getUserDistributions(
    userId: string,
    limit: number = 50,
  ): Promise<TokenDistribution[]> {
    return this.distributionRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getDistributionStats(userId: string): Promise<{
    totalDistributed: number;
    pendingAmount: number;
    completedCount: number;
    pendingCount: number;
  }> {
    const distributions = await this.distributionRepository.find({
      where: { userId },
    });

    let totalDistributed = 0;
    let pendingAmount = 0;
    let completedCount = 0;
    let pendingCount = 0;

    for (const dist of distributions) {
      if (dist.status === DistributionStatus.COMPLETED) {
        totalDistributed += dist.amount;
        completedCount++;
      } else if (dist.status === DistributionStatus.PENDING) {
        pendingAmount += dist.amount;
        pendingCount++;
      }
    }

    return {
      totalDistributed,
      pendingAmount,
      completedCount,
      pendingCount,
    };
  }

  async createSeasonRewardDistributions(
    seasonId: string,
    rewards: Array<{ userId: string; amount: number; rank: number }>,
  ): Promise<TokenDistribution[]> {
    const distributions: TokenDistribution[] = [];

    for (const reward of rewards) {
      const distribution = await this.createDistribution({
        userId: reward.userId,
        type: DistributionType.SEASON_REWARD,
        amount: reward.amount,
        seasonId,
        metadata: {
          seasonRank: reward.rank,
        },
      });
      distributions.push(distribution);
    }

    this.logger.log(
      `Created ${distributions.length} season reward distributions for season ${seasonId}`,
    );

    return distributions;
  }

  async exchangeGemsForTokens(
    userId: string,
    gems: number,
    exchangeRate: number = 0.01, // 1 gem = 0.01 BZ
  ): Promise<TokenDistribution> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.gems < gems) {
      throw new Error('Insufficient gems');
    }

    const tokenAmount = gems * exchangeRate;

    // Deduct gems
    user.gems -= gems;
    await this.userRepository.save(user);

    // Create distribution
    const distribution = await this.createDistribution({
      userId,
      type: DistributionType.EXCHANGE,
      amount: tokenAmount,
      metadata: {
        gemsExchanged: gems,
        reason: `Exchanged ${gems} gems for ${tokenAmount} BZ tokens`,
      },
    });

    return distribution;
  }

  isBlockchainEnabled(): boolean {
    return this.isEnabled;
  }

  getTokenContractAddress(): string {
    return this.tokenContractAddress;
  }
}
