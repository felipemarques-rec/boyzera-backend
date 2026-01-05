import { GetProductsUseCase } from '../../use-cases/shop/get-products.use-case';
import { ProcessPurchaseUseCase } from '../../use-cases/shop/process-purchase.use-case';
import { ProductType, ProductCurrency } from '../../domain/entities/product.entity';
declare class PurchaseDto {
    productId: string;
    telegramPaymentId?: string;
}
export declare class ShopController {
    private getProductsUseCase;
    private processPurchaseUseCase;
    constructor(getProductsUseCase: GetProductsUseCase, processPurchaseUseCase: ProcessPurchaseUseCase);
    getProducts(req: any, type?: ProductType, currency?: ProductCurrency): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            description: string;
            type: ProductType;
            currency: ProductCurrency;
            price: number;
            displayPrice: string;
            reward: import("../../domain/entities/product.entity").ProductReward;
            imageUrl: string;
            iconUrl: string;
            hasDiscount: boolean;
            originalPrice: number | null;
            discountPercent: number | undefined;
            badgeText: string | undefined;
            canPurchase: boolean | undefined;
            remainingQuantity: number | undefined;
            userPurchaseCount: number | undefined;
        }[];
    }>;
    getProductById(id: string): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            id: string;
            name: string;
            description: string;
            type: ProductType;
            currency: ProductCurrency;
            price: number;
            displayPrice: string;
            reward: import("../../domain/entities/product.entity").ProductReward;
            imageUrl: string;
            iconUrl: string;
            metadata: import("../../domain/entities/product.entity").ProductMetadata;
        };
        message?: undefined;
    }>;
    getFeaturedProducts(): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            type: ProductType;
            currency: ProductCurrency;
            price: number;
            displayPrice: string;
            imageUrl: string;
            badgeText: string | undefined;
        }[];
    }>;
    getSpecialOffers(): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            description: string;
            price: number;
            displayPrice: string;
            originalPrice: number;
            discountPercent: number | undefined;
            reward: import("../../domain/entities/product.entity").ProductReward;
            validUntil: Date | undefined;
            imageUrl: string;
        }[];
    }>;
    getCategories(): Promise<{
        success: boolean;
        data: {
            type: ProductType;
            count: number;
        }[];
    }>;
    purchase(req: any, dto: PurchaseDto): Promise<{
        success: boolean;
        data: {
            purchaseId: string;
            status: import("../../domain/entities/purchase.entity").PurchaseStatus;
            reward: {
                gems: number | undefined;
                followers: string | undefined;
                energy: number | undefined;
                booster: {
                    type: import("../../domain/entities/product.entity").BoosterType;
                    expiresAt: Date;
                    multiplier: number;
                } | null;
            };
        };
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        data?: undefined;
    }>;
    getPurchaseHistory(req: any, limit: number): Promise<{
        success: boolean;
        data: {
            id: string;
            productId: string;
            productName: string;
            status: import("../../domain/entities/purchase.entity").PurchaseStatus;
            currency: string;
            amount: number;
            reward: import("../../domain/entities/product.entity").ProductReward;
            createdAt: Date;
            completedAt: Date;
        }[];
    }>;
    getUserBoosters(req: any): Promise<{
        success: boolean;
        data: {
            id: string;
            type: import("../../domain/entities/product.entity").BoosterType;
            multiplier: number;
            expiresAt: Date;
            remainingHours: number;
            remainingMinutes: number;
        }[];
    }>;
}
export {};
