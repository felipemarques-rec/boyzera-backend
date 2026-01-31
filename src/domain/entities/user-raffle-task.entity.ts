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
import { RaffleTask } from './raffle-task.entity';
import { Raffle } from './raffle.entity';

export enum UserRaffleTaskStatus {
  PENDING = 'PENDING',
  VERIFYING = 'VERIFYING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REJECTED = 'REJECTED',
}

@Entity('user_raffle_tasks')
@Index(['userId', 'taskId'], { unique: true })
export class UserRaffleTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  taskId: string;

  @ManyToOne(() => RaffleTask, (task) => task.userTasks)
  @JoinColumn({ name: 'taskId' })
  task: RaffleTask;

  @Column()
  raffleId: string;

  @ManyToOne(() => Raffle)
  @JoinColumn({ name: 'raffleId' })
  raffle: Raffle;

  @Column({
    type: 'enum',
    enum: UserRaffleTaskStatus,
    default: UserRaffleTaskStatus.PENDING,
  })
  status: UserRaffleTaskStatus;

  @Column({ nullable: true })
  verificationData: string;

  @Column({ nullable: true })
  verifiedAt: Date;

  @Column({ default: false })
  ticketsClaimed: boolean;

  @Column({ nullable: true })
  failureReason: string;

  @CreateDateColumn()
  createdAt: Date;
}
