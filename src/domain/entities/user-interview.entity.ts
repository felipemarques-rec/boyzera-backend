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
import { Interview } from './interview.entity';

@Entity('user_interviews')
@Index(['userId', 'interviewId'], { unique: true })
export class UserInterview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  interviewId: string;

  @ManyToOne(() => Interview)
  @JoinColumn({ name: 'interviewId' })
  interview: Interview;

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
