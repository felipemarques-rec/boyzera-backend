import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum SeasonStatus {
  UPCOMING = 'upcoming',
  ACTIVE = 'active',
  ENDED = 'ended',
}

export interface SeasonRewardTier {
  rank: number; // Position in leaderboard (1, 2, 3, etc.) or 0 for range
  minRank?: number; // For range tiers (e.g., 4-10)
  maxRank?: number;
  gems: number;
  followers: string; // BigInt as string
  tokensBz: number;
  title?: string; // Special title reward
}

export interface SeasonPrizePool {
  totalGems: number;
  totalTokensBz: number;
  tiers: SeasonRewardTier[];
}

@Entity('seasons')
export class Season {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: SeasonStatus,
    default: SeasonStatus.UPCOMING,
  })
  @Index()
  status: SeasonStatus;

  @Column({ type: 'timestamp' })
  @Index()
  startDate: Date;

  @Column({ type: 'timestamp' })
  @Index()
  endDate: Date;

  @Column({ type: 'jsonb' })
  prizePool: SeasonPrizePool;

  @Column({ type: 'int', default: 1 })
  seasonNumber: number;

  @Column({ type: 'varchar', nullable: true })
  bannerUrl: string;

  @Column({ type: 'varchar', nullable: true })
  themeColor: string;

  @Column({ type: 'boolean', default: false })
  rewardsDistributed: boolean;

  @Column({ type: 'timestamp', nullable: true })
  rewardsDistributedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods
  isActive(): boolean {
    const now = new Date();
    return (
      this.status === SeasonStatus.ACTIVE &&
      now >= this.startDate &&
      now <= this.endDate
    );
  }

  isUpcoming(): boolean {
    const now = new Date();
    return this.status === SeasonStatus.UPCOMING && now < this.startDate;
  }

  hasEnded(): boolean {
    const now = new Date();
    return this.status === SeasonStatus.ENDED || now > this.endDate;
  }

  getDaysRemaining(): number {
    const now = new Date();
    if (now > this.endDate) return 0;
    const diff = this.endDate.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  getProgressPercentage(): number {
    const now = new Date();
    if (now < this.startDate) return 0;
    if (now > this.endDate) return 100;

    const total = this.endDate.getTime() - this.startDate.getTime();
    const elapsed = now.getTime() - this.startDate.getTime();
    return Math.round((elapsed / total) * 100);
  }
}
