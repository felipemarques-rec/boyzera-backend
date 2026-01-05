import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { bigintTransformer } from '../../shared/utils/bigint.transformer';

@Entity('users')
@Index(['level'])
@Index(['followers'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  telegramId: string;

  @Column({ nullable: true })
  username: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  nickname: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({
    type: 'bigint',
    default: 0,
    transformer: bigintTransformer,
  })
  followers: bigint;

  @Column({ default: 1 })
  level: number;

  @Column({ default: 1000 })
  energy: number;

  @Column({ default: 1000 })
  maxEnergy: number;

  @Column({ type: 'float', default: 1 })
  energyRegenRate: number;

  @Column({ type: 'float', default: 0 })
  profitPerHour: number;

  @Column({ default: 1 })
  tapMultiplier: number;

  @Column({ default: 0 })
  gems: number;

  @Column({ type: 'float', default: 0 })
  tokensBz: number;

  @Column({
    type: 'bigint',
    default: 0,
    transformer: bigintTransformer,
  })
  totalTaps: bigint;

  @Column({ default: 0 })
  combo: number;

  @Column({ type: 'float', default: 0 })
  engagement: number;

  @Column({ nullable: true })
  lastTapAt: Date;

  @Column({ nullable: true })
  lastEnergyUpdate: Date;

  @Column({ nullable: true })
  lastLoginAt: Date;

  @Column({ nullable: true })
  referrerId: string;

  @Column({ nullable: true })
  seasonId: string;

  @Column({ default: false })
  isBanned: boolean;

  @Column({ nullable: true })
  banReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
