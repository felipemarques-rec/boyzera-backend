import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { bigintTransformer } from '../../shared/utils/bigint.transformer';

export enum CollaborationType {
  BRAND = 'BRAND',
  INFLUENCER = 'INFLUENCER',
  MUSIC = 'MUSIC',
  EVENT = 'EVENT',
}

export enum CollaborationStatus {
  AVAILABLE = 'AVAILABLE',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED',
}

@Entity('collaborations')
export class Collaboration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: CollaborationType,
    default: CollaborationType.BRAND,
  })
  type: CollaborationType;

  @Column({ nullable: true })
  brandName: string;

  @Column({ nullable: true })
  brandLogo: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({
    type: 'bigint',
    default: 0,
    transformer: bigintTransformer,
  })
  followersReward: bigint;

  @Column({ default: 0 })
  gemsReward: number;

  @Column({ default: 0 })
  engagementBonus: number;

  @Column({ default: 1 })
  requiredLevel: number;

  @Column({ default: 0 })
  durationMinutes: number; // How long to complete

  @Column({ nullable: true })
  expiresAt: Date;

  @Column({ default: 0 })
  maxParticipants: number; // 0 = unlimited

  @Column({ default: 0 })
  currentParticipants: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
