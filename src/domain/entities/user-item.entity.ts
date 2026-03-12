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
import { GameItem } from './game-item.entity';

@Entity('user_items')
@Unique(['userId', 'itemId'])
@Index(['userId', 'isEquipped'])
export class UserItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  itemId: string;

  @ManyToOne(() => GameItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'itemId' })
  item: GameItem;

  @Column({ default: false })
  isEquipped: boolean;

  @CreateDateColumn()
  unlockedAt: Date;
}
