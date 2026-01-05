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
exports.AdminProductsController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("../../domain/entities/product.entity");
const admin_auth_guard_1 = require("../guards/admin-auth.guard");
let AdminProductsController = class AdminProductsController {
    productRepository;
    constructor(productRepository) {
        this.productRepository = productRepository;
    }
    async getProducts(type, currency, isActive) {
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
    async getStats() {
        const total = await this.productRepository.count();
        const active = await this.productRepository.count({ where: { isActive: true } });
        const byType = {};
        for (const type of Object.values(product_entity_1.ProductType)) {
            byType[type] = await this.productRepository.count({ where: { type } });
        }
        const byCurrency = {};
        for (const currency of Object.values(product_entity_1.ProductCurrency)) {
            byCurrency[currency] = await this.productRepository.count({ where: { currency } });
        }
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
    async getProduct(id) {
        const product = await this.productRepository.findOne({ where: { id } });
        if (!product) {
            return { error: 'Produto nao encontrado' };
        }
        return product;
    }
    async createProduct(dto) {
        const product = this.productRepository.create({
            ...dto,
            sortOrder: dto.sortOrder ?? 0,
            isActive: dto.isActive ?? true,
        });
        await this.productRepository.save(product);
        return { success: true, message: 'Produto criado', data: product };
    }
    async updateProduct(id, dto) {
        const product = await this.productRepository.findOne({ where: { id } });
        if (!product) {
            return { error: 'Produto nao encontrado' };
        }
        Object.assign(product, dto);
        await this.productRepository.save(product);
        return { success: true, message: 'Produto atualizado' };
    }
    async deleteProduct(id) {
        const product = await this.productRepository.findOne({ where: { id } });
        if (!product) {
            return { error: 'Produto nao encontrado' };
        }
        await this.productRepository.remove(product);
        return { success: true, message: 'Produto excluido' };
    }
    async toggleProduct(id) {
        const product = await this.productRepository.findOne({ where: { id } });
        if (!product) {
            return { error: 'Produto nao encontrado' };
        }
        product.isActive = !product.isActive;
        await this.productRepository.save(product);
        return { success: true, message: product.isActive ? 'Produto ativado' : 'Produto desativado' };
    }
};
exports.AdminProductsController = AdminProductsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Query)('currency')),
    __param(2, (0, common_1.Query)('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AdminProductsController.prototype, "getProducts", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminProductsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminProductsController.prototype, "getProduct", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminProductsController.prototype, "createProduct", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminProductsController.prototype, "updateProduct", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminProductsController.prototype, "deleteProduct", null);
__decorate([
    (0, common_1.Post)(':id/toggle'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminProductsController.prototype, "toggleProduct", null);
exports.AdminProductsController = AdminProductsController = __decorate([
    (0, common_1.Controller)('admin/products'),
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AdminProductsController);
//# sourceMappingURL=admin-products.controller.js.map