import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { bigintTransformer } from '../../shared/utils/bigint.transformer';

export enum PodcastCategory {
  ENTERTAINMENT = 'ENTERTAINMENT',
  MUSIC = 'MUSIC',
  LIFESTYLE = 'LIFESTYLE',
  BUSINESS = 'BUSINESS',
  COMEDY = 'COMEDY',
}

@Entity('podcasts')
export class Podcast {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: PodcastCategory,
    default: PodcastCategory.ENTERTAINMENT,
  })
  category: PodcastCategory;

  @Column({ nullable: true })
  hostName: string;

  @Column({ nullable: true })
  hostAvatar: string;

  @Column({ nullable: true })
  podcastName: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  audioUrl: string;

  @Column({ default: 0 })
  durationMinutes: number;

  @Column({
    type: 'bigint',
    default: 0,
    transformer: bigintTransformer,
  })
  followersReward: bigint;

  @Column({ default: 0 })
  gemsReward: number;

  @Column({ type: 'float', default: 0 })
  engagementChange: number;

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
