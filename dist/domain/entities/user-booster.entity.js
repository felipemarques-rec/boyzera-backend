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
exports.UserBooster = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const product_entity_1 = require("./product.entity");
let UserBooster = class UserBooster {
    id;
    userId;
    user;
    boosterType;
    multiplier;
    expiresAt;
    purchaseId;
    isActive;
    createdAt;
    isExpired() {
        return new Date() > this.expiresAt;
    }
    getRemainingHours() {
        const remaining = this.expiresAt.getTime() - Date.now();
        return Math.max(0, remaining / (1000 * 60 * 60));
    }
    getRemainingMinutes() {
        const remaining = this.expiresAt.getTime() - Date.now();
        return Math.max(0, remaining / (1000 * 60));
    }
};
exports.UserBooster = UserBooster;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], UserBooster.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], UserBooster.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], UserBooster.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: product_entity_1.BoosterType,
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], UserBooster.prototype, "boosterType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', default: 2 }),
    __metadata("design:type", Number)
], UserBooster.prototype, "multiplier", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Date)
], UserBooster.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], UserBooster.prototype, "purchaseId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], UserBooster.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], UserBooster.prototype, "createdAt", void 0);
exports.UserBooster = UserBooster = __decorate([
    (0, typeorm_1.Entity)('user_boosters'),
    (0, typeorm_1.Index)(['userId', 'expiresAt']),
    (0, typeorm_1.Index)(['boosterType', 'expiresAt'])
], UserBooster);
//# sourceMappingURL=user-booster.entity.js.map