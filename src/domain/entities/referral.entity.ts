import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { bigintTransformer } from '../../shared/utils/bigint.transformer';

@Entity('referrals')
@Unique(['referredId'])
@Index(['referrerId'])
export class Referral {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  referrerId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'referrerId' })
  referrer: User;

  @Column()
  referredId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'referredId' })
  referred: User;

  @Column({
    type: 'bigint',
    default: 0,
    transformer: bigintTransformer,
  })
  totalEarnedFollowers: bigint;

  @Column({ default: false })
  bonusClaimed: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
