import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { bigintTransformer } from '../../shared/utils/bigint.transformer';

export enum MissionType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  ACHIEVEMENT = 'achievement',
}

export enum MissionRequirementType {
  TAP_COUNT = 'tap_count',
  FOLLOWER_COUNT = 'follower_count',
  LEVEL_REACH = 'level_reach',
  UPGRADE_BUY = 'upgrade_buy',
  REFERRAL_COUNT = 'referral_count',
  COMBO_REACH = 'combo_reach',
  LOGIN_STREAK = 'login_streak',
  WATCH_ADS = 'watch_ads',
  CHALLENGE_WIN = 'challenge_win',
  COLLAB_COMPLETE = 'collab_complete',
}

export interface MissionRequirement {
  type: MissionRequirementType;
  target: number;
  upgradeCategory?: string;
}

export interface MissionReward {
  followers?: number;
  gems?: number;
  energy?: number;
  tokensBz?: number;
}

@Entity('missions')
@Index(['type'])
@Index(['isActive'])
export class Mission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: MissionType,
  })
  type: MissionType;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ type: 'jsonb' })
  requirement: MissionRequirement;

  @Column({ type: 'jsonb' })
  reward: MissionReward;

  @Column({ nullable: true })
  iconName: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ default: 0 })
  sortOrder: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 1 })
  requiredLevel: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
