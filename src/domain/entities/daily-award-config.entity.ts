import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('daily_award_configs')
@Index(['version'], { unique: true })
export class DailyAwardConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  version: string;

  @Column({ type: 'float', default: 0.7 })
  alpha: number;

  @Column({ type: 'float', default: 0.15 })
  beta: number;

  @Column({ type: 'float', default: 1.4 })
  gamma: number;

  @Column({ type: 'float', default: 0.5 })
  maxStreakBonus: number;

  @Column({ type: 'bigint', default: 1 })
  minDailyGain: string;

  @Column({ type: 'bigint', default: 1000000 })
  maxDailyGain: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
