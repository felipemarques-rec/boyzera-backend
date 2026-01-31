import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { RoulettePrize } from './roulette-prize.entity';

@Entity('roulette_spins')
export class RouletteSpin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  prizeId: string;

  @ManyToOne(() => RoulettePrize)
  @JoinColumn({ name: 'prizeId' })
  prize: RoulettePrize;

  @Column({ type: 'jsonb', nullable: true })
  rewardClaimed: {
    followers?: number;
    gems?: number;
    energy?: number;
    boosterType?: string;
  };

  @Column({ default: 0 })
  loginStreakAtSpin: number;

  @CreateDateColumn()
  createdAt: Date;
}
