import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Upgrade } from './upgrade.entity';

@Entity('user_upgrades')
export class UserUpgrade {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Upgrade)
  @JoinColumn({ name: 'upgradeId' })
  upgrade: Upgrade;

  @Column()
  upgradeId: string;

  @Column({ default: 1 })
  level: number;
}
