import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { BoosterType } from './product.entity';

@Entity('user_boosters')
@Index(['userId', 'expiresAt'])
@Index(['boosterType', 'expiresAt'])
export class UserBooster {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: BoosterType,
  })
  @Index()
  boosterType: BoosterType;

  @Column({ type: 'float', default: 2 })
  multiplier: number;

  @Column({ type: 'timestamp' })
  @Index()
  expiresAt: Date;

  @Column({ type: 'uuid', nullable: true })
  purchaseId: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  // Helper methods
  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  getRemainingHours(): number {
    const remaining = this.expiresAt.getTime() - Date.now();
    return Math.max(0, remaining / (1000 * 60 * 60));
  }

  getRemainingMinutes(): number {
    const remaining = this.expiresAt.getTime() - Date.now();
    return Math.max(0, remaining / (1000 * 60));
  }
}
