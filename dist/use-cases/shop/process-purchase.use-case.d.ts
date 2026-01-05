import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Product, BoosterType } from '../../domain/entities/product.entity';
import { Purchase } from '../../domain/entities/purchase.entity';
import { User } from '../../domain/entities/user.entity';
import { UserBooster } from '../../domain/entities/user-booster.entity';
export interface ProcessPurchaseParams {
    userId: string;
    productId: string;
    telegramPaymentId?: string;
    metadata?: Record<string, any>;
}
export interface PurchaseResult {
    purchase: Purchase;
    reward: {
        gems?: number;
        followers?: bigint;
        energy?: number;
        booster?: {
            type: BoosterType;
            expiresAt: Date;
            multiplier: number;
        };
    };
}
export declare class ProcessPurchaseUseCase {
    private productRepository;
    private purchaseRepository;
    private userRepository;
    private userBoosterRepository;
    private eventEmitter;
    constructor(productRepository: Repository<Product>, purchaseRepository: Repository<Purchase>, userRepository: Repository<User>, userBoosterRepository: Repository<UserBooster>, eventEmitter: EventEmitter2);
    execute(params: ProcessPurchaseParams): Promise<PurchaseResult>;
    private validateAndDeductCurrency;
    private applyRewards;
    getPurchaseHistory(userId: string, limit?: number): Promise<Purchase[]>;
    getUserBoosters(userId: string): Promise<UserBooster[]>;
    getActiveBoosterMultiplier(userId: string, boosterType: BoosterType): Promise<number>;
}
