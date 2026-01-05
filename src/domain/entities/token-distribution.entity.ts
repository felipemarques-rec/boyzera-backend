import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Season } from './season.entity';

export enum DistributionType {
  SEASON_REWARD = 'season_reward', // End of season rewards
  AIRDROP = 'airdrop', // Special airdrops
  REFERRAL_BONUS = 'referral_bonus', // Referral rewards
  ACHIEVEMENT = 'achievement', // Achievement unlocks
  EXCHANGE = 'exchange', // Gem to token exchange
  MANUAL = 'manual', // Manual distribution (admin)
}

export enum DistributionStatus {
  PENDING = 'pending', // Waiting to be processed
  PROCESSING = 'processing', // Transaction in progress
  COMPLETED = 'completed', // Successfully distributed
  FAILED = 'failed', // Transaction failed
  CANCELLED = 'cancelled', // Cancelled by admin
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

@Entity('token_distributions')
@Index(['userId', 'status'])
@Index(['type', 'status'])
@Index(['seasonId', 'status'])
export class TokenDistribution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: DistributionType,
  })
  @Index()
  type: DistributionType;

  @Column({
    type: 'enum',
    enum: DistributionStatus,
    default: DistributionStatus.PENDING,
  })
  @Index()
  status: DistributionStatus;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  amount: number; // Token amount (BZ)

  @Column({ type: 'varchar', length: 128, nullable: true })
  walletAddress?: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  @Index()
  transactionHash?: string;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  seasonId?: string;

  @ManyToOne(() => Season, { nullable: true })
  @JoinColumn({ name: 'seasonId' })
  season?: Season;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: DistributionMetadata;

  @Column({ type: 'text', nullable: true })
  errorMessage?: string;

  @Column({ type: 'int', default: 0 })
  retryCount: number;

  @Column({ type: 'timestamp', nullable: true })
  processedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods
  isPending(): boolean {
    return this.status === DistributionStatus.PENDING;
  }

  isCompleted(): boolean {
    return this.status === DistributionStatus.COMPLETED;
  }

  canRetry(): boolean {
    return this.status === DistributionStatus.FAILED && this.retryCount < 3;
  }

  getExplorerUrl(network: 'mainnet' | 'testnet' = 'mainnet'): string | null {
    if (!this.transactionHash) return null;
    const baseUrl =
      network === 'mainnet'
        ? 'https://tonscan.org/tx/'
        : 'https://testnet.tonscan.org/tx/';
    return `${baseUrl}${this.transactionHash}`;
  }
}
