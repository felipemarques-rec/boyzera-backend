import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

export enum TransactionType {
  TAP = 'tap',
  PASSIVE = 'passive',
  PURCHASE = 'purchase',
  REWARD = 'reward',
  REFERRAL = 'referral',
  TOKEN_EXCHANGE = 'token_exchange',
  MISSION_REWARD = 'mission_reward',
  LEVEL_UP = 'level_up',
  SEASON_REWARD = 'season_reward',
  UPGRADE_PURCHASE = 'upgrade_purchase',
}

export enum CurrencyType {
  FOLLOWERS = 'followers',
  GEMS = 'gems',
  TOKENS_BZ = 'tokens_bz',
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

@Entity('transactions')
@Index(['userId', 'createdAt'])
@Index(['type', 'createdAt'])
export class Transaction {
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
    enum: TransactionType,
  })
  @Index()
  type: TransactionType;

  @Column({
    type: 'enum',
    enum: CurrencyType,
  })
  currency: CurrencyType;

  @Column({
    type: 'decimal',
    precision: 30,
    scale: 0,
    transformer: {
      to: (value: bigint | number) => value?.toString(),
      from: (value: string) => (value ? BigInt(value) : BigInt(0)),
    },
  })
  amount: bigint;

  @Column({
    type: 'decimal',
    precision: 30,
    scale: 0,
    nullable: true,
    transformer: {
      to: (value: bigint | number | null) => value?.toString() ?? null,
      from: (value: string | null) => (value ? BigInt(value) : null),
    },
  })
  balanceBefore: bigint | null;

  @Column({
    type: 'decimal',
    precision: 30,
    scale: 0,
    nullable: true,
    transformer: {
      to: (value: bigint | number | null) => value?.toString() ?? null,
      from: (value: string | null) => (value ? BigInt(value) : null),
    },
  })
  balanceAfter: bigint | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: TransactionMetadata;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  seasonId: string;

  @CreateDateColumn()
  @Index()
  createdAt: Date;

  // Helper methods
  isCredit(): boolean {
    return this.amount > BigInt(0);
  }

  isDebit(): boolean {
    return this.amount < BigInt(0);
  }

  getAbsoluteAmount(): bigint {
    return this.amount < BigInt(0) ? -this.amount : this.amount;
  }

  getFormattedAmount(): string {
    const abs = this.getAbsoluteAmount();
    const prefix = this.isDebit() ? '-' : '+';
    return `${prefix}${abs.toString()}`;
  }
}
