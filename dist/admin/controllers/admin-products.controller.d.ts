import { Repository } from 'typeorm';
import { Product, ProductType, ProductCurrency, ProductReward, ProductMetadata } from '../../domain/entities/product.entity';
interface CreateProductDto {
    name: string;
    description?: string;
    type: ProductType;
    currency: ProductCurrency;
    price: number;
    reward: ProductReward;
    metadata?: ProductMetadata;
    imageUrl?: string;
    iconUrl?: string;
    sortOrder?: number;
    isActive?: boolean;
}
interface UpdateProductDto extends Partial<CreateProductDto> {
}
export declare class AdminProductsController {
    private productRepository;
    constructor(productRepository: Repository<Product>);
    getProducts(type?: ProductType, currency?: ProductCurrency, isActive?: string): Promise<{
        data: Product[];
        total: number;
    }>;
    getStats(): Promise<{
        total: number;
        active: number;
        inactive: number;
        totalPurchases: number;
        byType: Record<string, number>;
        byCurrency: Record<string, number>;
    }>;
    getProduct(id: string): Promise<Product | {
        error: string;
    }>;
    createProduct(dto: CreateProductDto): Promise<{
        success: boolean;
        message: string;
        data: Product;
    }>;
    updateProduct(id: string, dto: UpdateProductDto): Promise<{
        error: string;
        success?: undefined;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        error?: undefined;
    }>;
    deleteProduct(id: string): Promise<{
        error: string;
        success?: undefined;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        error?: undefined;
    }>;
    toggleProduct(id: string): Promise<{
        error: string;
        success?: undefined;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        error?: undefined;
    }>;
}
export {};
