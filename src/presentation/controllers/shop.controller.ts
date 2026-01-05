import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetProductsUseCase } from '../../use-cases/shop/get-products.use-case';
import { ProcessPurchaseUseCase } from '../../use-cases/shop/process-purchase.use-case';
import {
  ProductType,
  ProductCurrency,
} from '../../domain/entities/product.entity';

class PurchaseDto {
  productId: string;
  telegramPaymentId?: string;
}

@Controller('shop')
@UseGuards(AuthGuard('jwt'))
export class ShopController {
  constructor(
    private getProductsUseCase: GetProductsUseCase,
    private processPurchaseUseCase: ProcessPurchaseUseCase,
  ) {}

  @Get('products')
  async getProducts(
    @Request() req: any,
    @Query('type') type?: ProductType,
    @Query('currency') currency?: ProductCurrency,
  ) {
    const products = await this.getProductsUseCase.execute(
      req.user.id,
      type,
      currency,
    );

    return {
      success: true,
      data: products.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        type: p.type,
        currency: p.currency,
        price: p.price,
        displayPrice: p.getDisplayPrice(),
        reward: p.reward,
        imageUrl: p.imageUrl,
        iconUrl: p.iconUrl,
        hasDiscount: p.hasDiscount(),
        originalPrice: p.hasDiscount() ? p.getOriginalPrice() : null,
        discountPercent: p.metadata?.discountPercent,
        badgeText: p.metadata?.badgeText,
        canPurchase: p.canPurchase,
        remainingQuantity: p.remainingQuantity,
        userPurchaseCount: p.userPurchaseCount,
      })),
    };
  }

  @Get('products/:id')
  async getProductById(@Param('id') id: string) {
    const product = await this.getProductsUseCase.getProductById(id);

    if (!product) {
      return {
        success: false,
        message: 'Product not found',
      };
    }

    return {
      success: true,
      data: {
        id: product.id,
        name: product.name,
        description: product.description,
        type: product.type,
        currency: product.currency,
        price: product.price,
        displayPrice: product.getDisplayPrice(),
        reward: product.reward,
        imageUrl: product.imageUrl,
        iconUrl: product.iconUrl,
        metadata: product.metadata,
      },
    };
  }

  @Get('featured')
  async getFeaturedProducts() {
    const products = await this.getProductsUseCase.getFeaturedProducts();

    return {
      success: true,
      data: products.map((p) => ({
        id: p.id,
        name: p.name,
        type: p.type,
        currency: p.currency,
        price: p.price,
        displayPrice: p.getDisplayPrice(),
        imageUrl: p.imageUrl,
        badgeText: p.metadata?.badgeText,
      })),
    };
  }

  @Get('special-offers')
  async getSpecialOffers() {
    const products = await this.getProductsUseCase.getSpecialOffers();

    return {
      success: true,
      data: products.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        displayPrice: p.getDisplayPrice(),
        originalPrice: p.getOriginalPrice(),
        discountPercent: p.metadata?.discountPercent,
        reward: p.reward,
        validUntil: p.metadata?.validUntil,
        imageUrl: p.imageUrl,
      })),
    };
  }

  @Get('categories')
  async getCategories() {
    const categories = await this.getProductsUseCase.getCategories();

    return {
      success: true,
      data: categories,
    };
  }

  @Post('purchase')
  async purchase(@Request() req: any, @Body() dto: PurchaseDto) {
    try {
      const result = await this.processPurchaseUseCase.execute({
        userId: req.user.id,
        productId: dto.productId,
        telegramPaymentId: dto.telegramPaymentId,
      });

      return {
        success: true,
        data: {
          purchaseId: result.purchase.id,
          status: result.purchase.status,
          reward: {
            gems: result.reward.gems,
            followers: result.reward.followers?.toString(),
            energy: result.reward.energy,
            booster: result.reward.booster
              ? {
                  type: result.reward.booster.type,
                  expiresAt: result.reward.booster.expiresAt,
                  multiplier: result.reward.booster.multiplier,
                }
              : null,
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Purchase failed',
      };
    }
  }

  @Get('history')
  async getPurchaseHistory(
    @Request() req: any,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    const purchases = await this.processPurchaseUseCase.getPurchaseHistory(
      req.user.id,
      Math.min(limit, 100),
    );

    return {
      success: true,
      data: purchases.map((p) => ({
        id: p.id,
        productId: p.productId,
        productName: p.product?.name,
        status: p.status,
        currency: p.currency,
        amount: p.amount,
        reward: p.reward,
        createdAt: p.createdAt,
        completedAt: p.completedAt,
      })),
    };
  }

  @Get('boosters')
  async getUserBoosters(@Request() req: any) {
    const boosters = await this.processPurchaseUseCase.getUserBoosters(
      req.user.id,
    );

    return {
      success: true,
      data: boosters.map((b) => ({
        id: b.id,
        type: b.boosterType,
        multiplier: b.multiplier,
        expiresAt: b.expiresAt,
        remainingHours: b.getRemainingHours(),
        remainingMinutes: b.getRemainingMinutes(),
      })),
    };
  }
}
