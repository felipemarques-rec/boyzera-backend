import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Podcast } from './podcast.entity';

@Entity('user_podcasts')
@Index(['userId', 'podcastId'], { unique: true })
export class UserPodcast {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  podcastId: string;

  @ManyToOne(() => Podcast)
  @JoinColumn({ name: 'podcastId' })
  podcast: Podcast;

  @Column({ default: false })
  isCompleted: boolean;

  @Column({ type: 'jsonb', nullable: true })
  rewardsClaimed: {
    followers?: number;
    gems?: number;
  };

  @CreateDateColumn()
  participatedAt: Date;

  @Column({ nullable: true })
  completedAt: Date;
}
