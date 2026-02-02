import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { bigintTransformer } from '../../shared/utils/bigint.transformer';

export enum InterviewType {
  TV = 'TV',
  MAGAZINE = 'MAGAZINE',
  ONLINE = 'ONLINE',
  RADIO = 'RADIO',
}

@Entity('interviews')
export class Interview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: InterviewType,
    default: InterviewType.ONLINE,
  })
  type: InterviewType;

  @Column({ nullable: true })
  hostName: string;

  @Column({ nullable: true })
  hostAvatar: string;

  @Column({ nullable: true })
  channelName: string;

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

  @Column({ type: 'float', default: 0 })
  engagementChange: number; // Can be positive or negative

  @Column({ default: 1 })
  requiredLevel: number;

  @Column({ nullable: true })
  availableFrom: Date;

  @Column({ nullable: true })
  availableUntil: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
