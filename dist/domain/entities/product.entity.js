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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = exports.BoosterType = exports.ProductCurrency = exports.ProductType = void 0;
const typeorm_1 = require("typeorm");
var ProductType;
(function (ProductType) {
    ProductType["GEMS"] = "gems";
    ProductType["BOOSTER"] = "booster";
    ProductType["SKIN"] = "skin";
    ProductType["ENERGY_PACK"] = "energy_pack";
    ProductType["VIP_PASS"] = "vip_pass";
    ProductType["SPECIAL_OFFER"] = "special_offer";
})(ProductType || (exports.ProductType = ProductType = {}));
var ProductCurrency;
(function (ProductCurrency) {
    ProductCurrency["STARS"] = "stars";
    ProductCurrency["GEMS"] = "gems";
    ProductCurrency["FOLLOWERS"] = "followers";
    ProductCurrency["REAL_MONEY"] = "real_money";
})(ProductCurrency || (exports.ProductCurrency = ProductCurrency = {}));
var BoosterType;
(function (BoosterType) {
    BoosterType["TAP_MULTIPLIER"] = "tap_multiplier";
    BoosterType["ENERGY_REGEN"] = "energy_regen";
    BoosterType["PASSIVE_INCOME"] = "passive_income";
    BoosterType["XP_BOOST"] = "xp_boost";
})(BoosterType || (exports.BoosterType = BoosterType = {}));
let Product = class Product {
    id;
    name;
    description;
    type;
    currency;
    price;
    reward;
    metadata;
    imageUrl;
    iconUrl;
    sortOrder;
    isActive;
    purchaseCount;
    createdAt;
    updatedAt;
    isAvailable() {
        if (!this.isActive)
            return false;
        if (this.metadata?.validUntil) {
            return new Date() < this.metadata.validUntil;
        }
        if (this.metadata?.limitedQuantity !== undefined) {
            return this.purchaseCount < this.metadata.limitedQuantity;
        }
        return true;
    }
    getDisplayPrice() {
        switch (this.currency) {
            case ProductCurrency.STARS:
                return `⭐ ${this.price}`;
            case ProductCurrency.GEMS:
                return `💎 ${this.price}`;
            case ProductCurrency.FOLLOWERS:
                return `👥 ${this.price}`;
            default:
                return `${this.price}`;
        }
    }
    hasDiscount() {
        return (this.metadata?.discountPercent ?? 0) > 0;
    }
    getOriginalPrice() {
        if (this.metadata?.originalPrice) {
            return this.metadata.originalPrice;
        }
        if (this.metadata?.discountPercent) {
            return this.price / (1 - this.metadata.discountPercent / 100);
        }
        return this.price;
    }
};
exports.Product = Product;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Product.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Product.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ProductType,
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Product.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ProductCurrency,
    }),
    __metadata("design:type", String)
], Product.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 2 }),
    __metadata("design:type", Number)
], Product.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Object)
], Product.prototype, "reward", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Product.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "imageUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "iconUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Product.prototype, "sortOrder", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Boolean)
], Product.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Product.prototype, "purchaseCount", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Product.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Product.prototype, "updatedAt", void 0);
exports.Product = Product = __decorate([
    (0, typeorm_1.Entity)('products'),
    (0, typeorm_1.Index)(['type', 'isActive'])
], Product);
//# sourceMappingURL=product.entity.js.map