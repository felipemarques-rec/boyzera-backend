import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Raffle } from './raffle.entity';
import { UserRaffleTask } from './user-raffle-task.entity';

export enum RaffleTaskType {
  INSTAGRAM_FOLLOW = 'INSTAGRAM_FOLLOW',
  INSTAGRAM_LIKE = 'INSTAGRAM_LIKE',
  INSTAGRAM_COMMENT = 'INSTAGRAM_COMMENT',
  TWITTER_FOLLOW = 'TWITTER_FOLLOW',
  TWITTER_RETWEET = 'TWITTER_RETWEET',
  TWITTER_LIKE = 'TWITTER_LIKE',
  YOUTUBE_SUBSCRIBE = 'YOUTUBE_SUBSCRIBE',
  YOUTUBE_LIKE = 'YOUTUBE_LIKE',
  TELEGRAM_JOIN = 'TELEGRAM_JOIN',
  DISCORD_JOIN = 'DISCORD_JOIN',
  MANUAL_VERIFICATION = 'MANUAL_VERIFICATION',
}

export enum RaffleTaskStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity('raffle_tasks')
export class RaffleTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  raffleId: string;

  @ManyToOne(() => Raffle, (raffle) => raffle.tasks)
  @JoinColumn({ name: 'raffleId' })
  raffle: Raffle;

  @Column({
    type: 'enum',
    enum: RaffleTaskType,
  })
  type: RaffleTaskType;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  iconUrl: string;

  @Column()
  targetUrl: string;

  @Column({ nullable: true })
  targetUsername: string;

  @Column({ nullable: true })
  targetPostId: string;

  @Column({ default: 1 })
  ticketsReward: number;

  @Column({
    type: 'enum',
    enum: RaffleTaskStatus,
    default: RaffleTaskStatus.ACTIVE,
  })
  status: RaffleTaskStatus;

  @Column({ default: 0 })
  sortOrder: number;

  @Column({ default: false })
  requiresManualVerification: boolean;

  @OneToMany(() => UserRaffleTask, (userTask) => userTask.task)
  userTasks: UserRaffleTask[];

  @CreateDateColumn()
  createdAt: Date;
}
