import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('hype_configs')
@Index(['version'], { unique: true })
export class HypeConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  version: string;

  @Column({ type: 'float', default: 0.15 })
  beta: number;

  @Column({ type: 'float', default: 1.2 })
  gamma: number;

  @Column({ type: 'float', default: 0.20 })
  maxStreakBonus: number;

  @Column({ type: 'float', default: 0.005 })
  minDailyGain: number;

  @Column({ type: 'float', default: 0.03 })
  decayLight: number;

  @Column({ type: 'float', default: 0.05 })
  decayNormal: number;

  @Column({ type: 'float', default: 0.07 })
  decayHeavy: number;

  @Column({ type: 'float', default: 0.3 })
  minEngagementThreshold: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
