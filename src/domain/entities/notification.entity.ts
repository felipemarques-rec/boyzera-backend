import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

export enum NotificationType {
  LEVEL_UP = 'level_up',
  MISSION_COMPLETE = 'mission_complete',
  REFERRAL_BONUS = 'referral_bonus',
  ENERGY_FULL = 'energy_full',
  DAILY_REWARD = 'daily_reward',
  ACHIEVEMENT = 'achievement',
  CHALLENGE_INVITE = 'challenge_invite',
  CHALLENGE_RESULT = 'challenge_result',
  SEASON_END = 'season_end',
  SYSTEM = 'system',
}

@Entity('notifications')
@Index(['userId'])
@Index(['isRead'])
@Index(['createdAt'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column()
  title: string;

  @Column()
  message: string;

  @Column({ nullable: true })
  iconName: string;

  @Column({ type: 'jsonb', nullable: true })
  data: Record<string, any>;

  @Column({ default: false })
  isRead: boolean;

  @Column({ nullable: true })
  readAt: Date;

  @Column({ nullable: true })
  actionUrl: string;

  @CreateDateColumn()
  createdAt: Date;
}
