import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Product,
  ProductType,
  ProductCurrency,
  ProductReward,
  ProductMetadata,
} from '../../domain/entities/product.entity';
import { AdminAuthGuard } from '../guards/admin-auth.guard';

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

interface UpdateProductDto extends Partial<CreateProductDto> {}

@Controller('admin/products')
@UseGuards(AdminAuthGuard)
export class AdminProductsController {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  @Get()
  async getProducts(
    @Query('type') type?: ProductType,
    @Query('currency') currency?: ProductCurrency,
    @Query('isActive') isActive?: string,
  ) {
    const queryBuilder = this.productRepository.createQueryBuilder('product');

    if (type) {
      queryBuilder.andWhere('product.type = :type', { type });
    }

    if (currency) {
      queryBuilder.andWhere('product.currency = :currency', { currency });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('product.isActive = :isActive', {
        isActive: isActive === 'true',
      });
    }

    queryBuilder.orderBy('product.sortOrder', 'ASC');

    const products = await queryBuilder.getMany();

    return {
      data: products,
      total: products.length,
    };
  }

  @Get('stats')
  async getStats() {
    const total = await this.productRepository.count();
    const active = await this.productRepository.count({ where: { isActive: true } });

    const byType: Record<string, number> = {};
    for (const type of Object.values(ProductType)) {
      byType[type] = await this.productRepository.count({ where: { type } });
    }

    const byCurrency: Record<string, number> = {};
    for (const currency of Object.values(ProductCurrency)) {
      byCurrency[currency] = await this.productRepository.count({ where: { currency } });
    }

    // Total purchases
    const totalPurchases = await this.productRepository
      .createQueryBuilder('product')
      .select('SUM(product.purchaseCount)', 'total')
      .getRawOne();

    return {
      total,
      active,
      inactive: total - active,
      totalPurchases: parseInt(totalPurchases?.total || '0'),
      byType,
      byCurrency,
    };
  }

  @Get(':id')
  async getProduct(@Param('id') id: string) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      return { error: 'Produto nao encontrado' };
    }
    return product;
  }

  @Post()
  async createProduct(@Body() dto: CreateProductDto) {
    const product = this.productRepository.create({
      ...dto,
      sortOrder: dto.sortOrder ?? 0,
      isActive: dto.isActive ?? true,
    });

    await this.productRepository.save(product);

    return { success: true, message: 'Produto criado', data: product };
  }

  @Patch(':id')
  async updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      return { error: 'Produto nao encontrado' };
    }

    Object.assign(product, dto);
    await this.productRepository.save(product);

    return { success: true, message: 'Produto atualizado' };
  }

  @Delete(':id')
  async deleteProduct(@Param('id') id: string) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      return { error: 'Produto nao encontrado' };
    }

    await this.productRepository.remove(product);

    return { success: true, message: 'Produto excluido' };
  }

  @Post(':id/toggle')
  async toggleProduct(@Param('id') id: string) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      return { error: 'Produto nao encontrado' };
    }

    product.isActive = !product.isActive;
    await this.productRepository.save(product);

    return { success: true, message: product.isActive ? 'Produto ativado' : 'Produto desativado' };
  }
}
