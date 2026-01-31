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
import { Raffle } from './raffle.entity';
import { RaffleTask } from './raffle-task.entity';

@Entity('raffle_tickets')
@Index(['userId', 'raffleId'])
export class RaffleTicket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  raffleId: string;

  @ManyToOne(() => Raffle, (raffle) => raffle.tickets)
  @JoinColumn({ name: 'raffleId' })
  raffle: Raffle;

  @Column({ nullable: true })
  taskId: string;

  @ManyToOne(() => RaffleTask, { nullable: true })
  @JoinColumn({ name: 'taskId' })
  task: RaffleTask;

  @Column()
  ticketNumber: string;

  @Column({ default: false })
  isWinner: boolean;

  @Column({ nullable: true })
  wonAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
