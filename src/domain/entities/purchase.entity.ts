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
import { Product } from './product.entity';
import type { ProductReward } from './product.entity';

export enum PurchaseStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
}

export interface PurchaseMetadata {
  telegramPaymentId?: string;
  telegramInvoiceId?: string;
  paymentProvider?: string;
  ipAddress?: string;
  userAgent?: string;
  errorMessage?: string;
  refundReason?: string;
  refundedAt?: Date;
}

@Entity('purchases')
@Index(['userId', 'createdAt'])
@Index(['status', 'createdAt'])
export class Purchase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  @Index()
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({
    type: 'enum',
    enum: PurchaseStatus,
    default: PurchaseStatus.PENDING,
  })
  @Index()
  status: PurchaseStatus;

  @Column({ type: 'varchar' })
  currency: string;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  amount: number;

  @Column({ type: 'jsonb' })
  reward: ProductReward;

  @Column({ type: 'boolean', default: false })
  rewardApplied: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: PurchaseMetadata;

  @CreateDateColumn()
  @Index()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  // Helper methods
  isPending(): boolean {
    return this.status === PurchaseStatus.PENDING;
  }

  isCompleted(): boolean {
    return this.status === PurchaseStatus.COMPLETED;
  }

  canRefund(): boolean {
    if (this.status !== PurchaseStatus.COMPLETED) return false;
    // Allow refunds within 24 hours
    const hoursSincePurchase =
      (Date.now() - this.completedAt.getTime()) / (1000 * 60 * 60);
    return hoursSincePurchase < 24;
  }
}
