import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../../domain/entities/product.entity';
import { Purchase } from '../../domain/entities/purchase.entity';
import { User } from '../../domain/entities/user.entity';
import { UserBooster } from '../../domain/entities/user-booster.entity';
import { GetProductsUseCase } from '../../use-cases/shop/get-products.use-case';
import { ProcessPurchaseUseCase } from '../../use-cases/shop/process-purchase.use-case';
import { ShopController } from '../../presentation/controllers/shop.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Purchase, User, UserBooster])],
  controllers: [ShopController],
  providers: [GetProductsUseCase, ProcessPurchaseUseCase],
  exports: [GetProductsUseCase, ProcessPurchaseUseCase],
})
export class ShopModule {}
