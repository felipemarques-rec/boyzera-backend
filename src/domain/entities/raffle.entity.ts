import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { RaffleTicket } from './raffle-ticket.entity';
import { RaffleTask } from './raffle-task.entity';

export enum RaffleStatus {
  UPCOMING = 'UPCOMING',
  ACTIVE = 'ACTIVE',
  DRAWING = 'DRAWING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum RafflePrizeType {
  FOLLOWERS = 'FOLLOWERS',
  GEMS = 'GEMS',
  TOKENS = 'TOKENS',
  PHYSICAL_ITEM = 'PHYSICAL_ITEM',
  IN_GAME_ITEM = 'IN_GAME_ITEM',
  EXCLUSIVE_SKIN = 'EXCLUSIVE_SKIN',
}

@Entity('raffles')
export class Raffle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  bannerUrl: string;

  @Column({
    type: 'enum',
    enum: RaffleStatus,
    default: RaffleStatus.UPCOMING,
  })
  status: RaffleStatus;

  @Column({
    type: 'enum',
    enum: RafflePrizeType,
  })
  prizeType: RafflePrizeType;

  @Column()
  prizeName: string;

  @Column({ type: 'text', nullable: true })
  prizeDescription: string;

  @Column({ nullable: true })
  prizeImageUrl: string;

  @Column({ type: 'bigint', default: 0 })
  prizeFollowersAmount: bigint;

  @Column({ default: 0 })
  prizeGemsAmount: number;

  @Column({ type: 'decimal', precision: 18, scale: 8, default: 0 })
  prizeTokensAmount: number;

  @Column()
  startsAt: Date;

  @Column()
  endsAt: Date;

  @Column()
  drawAt: Date;

  @Column({ default: 0 })
  maxTicketsPerUser: number;

  @Column({ default: 0 })
  totalTickets: number;

  @Column({ default: 1 })
  numberOfWinners: number;

  @Column({ default: 1 })
  requiredLevel: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  sortOrder: number;

  @Column({ nullable: true })
  winnerId: string;

  @Column({ type: 'jsonb', nullable: true })
  winnerIds: string[];

  @OneToMany(() => RaffleTicket, (ticket) => ticket.raffle)
  tickets: RaffleTicket[];

  @OneToMany(() => RaffleTask, (task) => task.raffle)
  tasks: RaffleTask[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
