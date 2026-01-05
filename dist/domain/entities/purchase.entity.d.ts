import { User } from './user.entity';
import { Product } from './product.entity';
import type { ProductReward } from './product.entity';
export declare enum PurchaseStatus {
    PENDING = "pending",
    COMPLETED = "completed",
    FAILED = "failed",
    REFUNDED = "refunded",
    CANCELLED = "cancelled"
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
export declare class Purchase {
    id: string;
    userId: string;
    user: User;
    productId: string;
    product: Product;
    status: PurchaseStatus;
    currency: string;
    amount: number;
    reward: ProductReward;
    rewardApplied: boolean;
    metadata: PurchaseMetadata;
    createdAt: Date;
    completedAt: Date;
    isPending(): boolean;
    isCompleted(): boolean;
    canRefund(): boolean;
}
