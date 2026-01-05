import { User } from './user.entity';
import { BoosterType } from './product.entity';
export declare class UserBooster {
    id: string;
    userId: string;
    user: User;
    boosterType: BoosterType;
    multiplier: number;
    expiresAt: Date;
    purchaseId: string;
    isActive: boolean;
    createdAt: Date;
    isExpired(): boolean;
    getRemainingHours(): number;
    getRemainingMinutes(): number;
}
