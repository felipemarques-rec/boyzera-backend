import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Product,
  ProductType,
  ProductCurrency,
} from '../../domain/entities/product.entity';
import { Purchase } from '../../domain/entities/purchase.entity';

export type ProductWithAvailability = Product & {
  userPurchaseCount?: number;
  canPurchase?: boolean;
  remainingQuantity?: number;
};

@Injectable()
export class GetProductsUseCase {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Purchase)
    private purchaseRepository: Repository<Purchase>,
  ) {}

  async execute(
    userId?: string,
    type?: ProductType,
    currency?: ProductCurrency,
  ): Promise<ProductWithAvailability[]> {
    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .where('product.isActive = :isActive', { isActive: true })
      .orderBy('product.sortOrder', 'ASC')
      .addOrderBy('product.price', 'ASC');

    if (type) {
      queryBuilder.andWhere('product.type = :type', { type });
    }

    if (currency) {
      queryBuilder.andWhere('product.currency = :currency', { currency });
    }

    const products = await queryBuilder.getMany();

    // Filter out unavailable products and add availability info
    const availableProducts: ProductWithAvailability[] = [];

    for (const product of products) {
      if (!product.isAvailable()) continue;

      const productWithAvail = product as ProductWithAvailability;

      if (userId && product.metadata?.purchaseLimit) {
        const userPurchaseCount = await this.getUserPurchaseCount(
          userId,
          product.id,
        );
        productWithAvail.userPurchaseCount = userPurchaseCount;
        productWithAvail.canPurchase =
          userPurchaseCount < product.metadata.purchaseLimit;
      } else {
        productWithAvail.canPurchase = true;
      }

      if (product.metadata?.limitedQuantity) {
        productWithAvail.remainingQuantity =
          product.metadata.limitedQuantity - product.purchaseCount;
      }

      availableProducts.push(productWithAvail);
    }

    return availableProducts;
  }

  async getProductById(productId: string): Promise<Product | null> {
    return this.productRepository.findOne({
      where: { id: productId, isActive: true },
    });
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return this.productRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC' },
      take: 6,
    });
  }

  async getProductsByType(type: ProductType): Promise<Product[]> {
    return this.productRepository.find({
      where: { type, isActive: true },
      order: { sortOrder: 'ASC', price: 'ASC' },
    });
  }

  async getSpecialOffers(): Promise<Product[]> {
    const products = await this.productRepository.find({
      where: { type: ProductType.SPECIAL_OFFER, isActive: true },
      order: { sortOrder: 'ASC' },
    });

    // Filter to only valid offers
    return products.filter((p) => p.isAvailable());
  }

  private async getUserPurchaseCount(
    userId: string,
    productId: string,
  ): Promise<number> {
    return this.purchaseRepository.count({
      where: {
        userId,
        productId,
        status: 'completed' as any,
      },
    });
  }

  async getCategories(): Promise<{ type: ProductType; count: number }[]> {
    const results = await this.productRepository
      .createQueryBuilder('product')
      .select('product.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('product.isActive = :isActive', { isActive: true })
      .groupBy('product.type')
      .getRawMany();

    return results.map((r) => ({
      type: r.type,
      count: parseInt(r.count, 10),
    }));
  }
}
