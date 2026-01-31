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
import { Collaboration } from './collaboration.entity';

export enum UserCollaborationStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Entity('user_collaborations')
@Index(['userId', 'collaborationId'], { unique: true })
export class UserCollaboration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  collaborationId: string;

  @ManyToOne(() => Collaboration)
  @JoinColumn({ name: 'collaborationId' })
  collaboration: Collaboration;

  @Column({
    type: 'enum',
    enum: UserCollaborationStatus,
    default: UserCollaborationStatus.IN_PROGRESS,
  })
  status: UserCollaborationStatus;

  @Column({ nullable: true })
  completedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  rewardsClaimed: {
    followers?: number;
    gems?: number;
  };

  @CreateDateColumn()
  startedAt: Date;
}
