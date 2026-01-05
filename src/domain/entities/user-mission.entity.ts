import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Mission } from './mission.entity';

@Entity('user_missions')
@Unique(['userId', 'missionId', 'periodStart'])
@Index(['userId'])
@Index(['missionId'])
@Index(['completed'])
export class UserMission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  missionId: string;

  @ManyToOne(() => Mission, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'missionId' })
  mission: Mission;

  @Column({ default: 0 })
  progress: number;

  @Column({ default: false })
  completed: boolean;

  @Column({ nullable: true })
  completedAt: Date;

  @Column({ default: false })
  claimed: boolean;

  @Column({ nullable: true })
  claimedAt: Date;

  @Column({ type: 'timestamp' })
  periodStart: Date;

  @Column({ type: 'timestamp', nullable: true })
  periodEnd: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
