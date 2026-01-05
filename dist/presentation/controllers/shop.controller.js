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
exports.ShopController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const get_products_use_case_1 = require("../../use-cases/shop/get-products.use-case");
const process_purchase_use_case_1 = require("../../use-cases/shop/process-purchase.use-case");
const product_entity_1 = require("../../domain/entities/product.entity");
class PurchaseDto {
    productId;
    telegramPaymentId;
}
let ShopController = class ShopController {
    getProductsUseCase;
    processPurchaseUseCase;
    constructor(getProductsUseCase, processPurchaseUseCase) {
        this.getProductsUseCase = getProductsUseCase;
        this.processPurchaseUseCase = processPurchaseUseCase;
    }
    async getProducts(req, type, currency) {
        const products = await this.getProductsUseCase.execute(req.user.id, type, currency);
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
    async getProductById(id) {
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
    async getCategories() {
        const categories = await this.getProductsUseCase.getCategories();
        return {
            success: true,
            data: categories,
        };
    }
    async purchase(req, dto) {
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
        }
        catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Purchase failed',
            };
        }
    }
    async getPurchaseHistory(req, limit) {
        const purchases = await this.processPurchaseUseCase.getPurchaseHistory(req.user.id, Math.min(limit, 100));
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
    async getUserBoosters(req) {
        const boosters = await this.processPurchaseUseCase.getUserBoosters(req.user.id);
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
};
exports.ShopController = ShopController;
__decorate([
    (0, common_1.Get)('products'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('type')),
    __param(2, (0, common_1.Query)('currency')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ShopController.prototype, "getProducts", null);
__decorate([
    (0, common_1.Get)('products/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ShopController.prototype, "getProductById", null);
__decorate([
    (0, common_1.Get)('featured'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ShopController.prototype, "getFeaturedProducts", null);
__decorate([
    (0, common_1.Get)('special-offers'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ShopController.prototype, "getSpecialOffers", null);
__decorate([
    (0, common_1.Get)('categories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ShopController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Post)('purchase'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, PurchaseDto]),
    __metadata("design:returntype", Promise)
], ShopController.prototype, "purchase", null);
__decorate([
    (0, common_1.Get)('history'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(50), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], ShopController.prototype, "getPurchaseHistory", null);
__decorate([
    (0, common_1.Get)('boosters'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ShopController.prototype, "getUserBoosters", null);
exports.ShopController = ShopController = __decorate([
    (0, common_1.Controller)('shop'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [get_products_use_case_1.GetProductsUseCase,
        process_purchase_use_case_1.ProcessPurchaseUseCase])
], ShopController);
//# sourceMappingURL=shop.controller.js.map