"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetProductsUseCase = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("../../domain/entities/product.entity");
const purchase_entity_1 = require("../../domain/entities/purchase.entity");
let GetProductsUseCase = class GetProductsUseCase {
    productRepository;
    purchaseRepository;
    constructor(productRepository, purchaseRepository) {
        this.productRepository = productRepository;
        this.purchaseRepository = purchaseRepository;
    }
    async execute(userId, type, currency) {
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
        const availableProducts = [];
        for (const product of products) {
            if (!product.isAvailable())
                continue;
            const productWithAvail = product;
            if (userId && product.metadata?.purchaseLimit) {
                const userPurchaseCount = await this.getUserPurchaseCount(userId, product.id);
                productWithAvail.userPurchaseCount = userPurchaseCount;
                productWithAvail.canPurchase =
                    userPurchaseCount < product.metadata.purchaseLimit;
            }
            else {
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
    async getProductById(productId) {
        return this.productRepository.findOne({
            where: { id: productId, isActive: true },
        });
    }
    async getFeaturedProducts() {
        return this.productRepository.find({
            where: { isActive: true },
            order: { sortOrder: 'ASC' },
            take: 6,
        });
    }
    async getProductsByType(type) {
        return this.productRepository.find({
            where: { type, isActive: true },
            order: { sortOrder: 'ASC', price: 'ASC' },
        });
    }
    async getSpecialOffers() {
        const products = await this.productRepository.find({
            where: { type: product_entity_1.ProductType.SPECIAL_OFFER, isActive: true },
            order: { sortOrder: 'ASC' },
        });
        return products.filter((p) => p.isAvailable());
    }
    async getUserPurchaseCount(userId, productId) {
        return this.purchaseRepository.count({
            where: {
                userId,
                productId,
                status: 'completed',
            },
        });
    }
    async getCategories() {
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
};
exports.GetProductsUseCase = GetProductsUseCase;
exports.GetProductsUseCase = GetProductsUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(1, (0, typeorm_1.InjectRepository)(purchase_entity_1.Purchase)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], GetProductsUseCase);
//# sourceMappingURL=get-products.use-case.js.map