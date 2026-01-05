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
exports.Purchase = exports.PurchaseStatus = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const product_entity_1 = require("./product.entity");
var PurchaseStatus;
(function (PurchaseStatus) {
    PurchaseStatus["PENDING"] = "pending";
    PurchaseStatus["COMPLETED"] = "completed";
    PurchaseStatus["FAILED"] = "failed";
    PurchaseStatus["REFUNDED"] = "refunded";
    PurchaseStatus["CANCELLED"] = "cancelled";
})(PurchaseStatus || (exports.PurchaseStatus = PurchaseStatus = {}));
let Purchase = class Purchase {
    id;
    userId;
    user;
    productId;
    product;
    status;
    currency;
    amount;
    reward;
    rewardApplied;
    metadata;
    createdAt;
    completedAt;
    isPending() {
        return this.status === PurchaseStatus.PENDING;
    }
    isCompleted() {
        return this.status === PurchaseStatus.COMPLETED;
    }
    canRefund() {
        if (this.status !== PurchaseStatus.COMPLETED)
            return false;
        const hoursSincePurchase = (Date.now() - this.completedAt.getTime()) / (1000 * 60 * 60);
        return hoursSincePurchase < 24;
    }
};
exports.Purchase = Purchase;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Purchase.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Purchase.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], Purchase.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Purchase.prototype, "productId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => product_entity_1.Product),
    (0, typeorm_1.JoinColumn)({ name: 'productId' }),
    __metadata("design:type", product_entity_1.Product)
], Purchase.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: PurchaseStatus,
        default: PurchaseStatus.PENDING,
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Purchase.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], Purchase.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 2 }),
    __metadata("design:type", Number)
], Purchase.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Object)
], Purchase.prototype, "reward", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Purchase.prototype, "rewardApplied", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Purchase.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Date)
], Purchase.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Purchase.prototype, "completedAt", void 0);
exports.Purchase = Purchase = __decorate([
    (0, typeorm_1.Entity)('purchases'),
    (0, typeorm_1.Index)(['userId', 'createdAt']),
    (0, typeorm_1.Index)(['status', 'createdAt'])
], Purchase);
//# sourceMappingURL=purchase.entity.js.map