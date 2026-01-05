import { Repository } from 'typeorm';
import { Product, ProductType, ProductCurrency } from '../../domain/entities/product.entity';
import { Purchase } from '../../domain/entities/purchase.entity';
export type ProductWithAvailability = Product & {
    userPurchaseCount?: number;
    canPurchase?: boolean;
    remainingQuantity?: number;
};
export declare class GetProductsUseCase {
    private productRepository;
    private purchaseRepository;
    constructor(productRepository: Repository<Product>, purchaseRepository: Repository<Purchase>);
    execute(userId?: string, type?: ProductType, currency?: ProductCurrency): Promise<ProductWithAvailability[]>;
    getProductById(productId: string): Promise<Product | null>;
    getFeaturedProducts(): Promise<Product[]>;
    getProductsByType(type: ProductType): Promise<Product[]>;
    getSpecialOffers(): Promise<Product[]>;
    private getUserPurchaseCount;
    getCategories(): Promise<{
        type: ProductType;
        count: number;
    }[]>;
}
