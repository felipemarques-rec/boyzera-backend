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
exports.Referral = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const bigint_transformer_1 = require("../../shared/utils/bigint.transformer");
let Referral = class Referral {
    id;
    referrerId;
    referrer;
    referredId;
    referred;
    totalEarnedFollowers;
    bonusClaimed;
    createdAt;
};
exports.Referral = Referral;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Referral.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Referral.prototype, "referrerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'referrerId' }),
    __metadata("design:type", user_entity_1.User)
], Referral.prototype, "referrer", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Referral.prototype, "referredId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'referredId' }),
    __metadata("design:type", user_entity_1.User)
], Referral.prototype, "referred", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'bigint',
        default: 0,
        transformer: bigint_transformer_1.bigintTransformer,
    }),
    __metadata("design:type", BigInt)
], Referral.prototype, "totalEarnedFollowers", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Referral.prototype, "bonusClaimed", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Referral.prototype, "createdAt", void 0);
exports.Referral = Referral = __decorate([
    (0, typeorm_1.Entity)('referrals'),
    (0, typeorm_1.Unique)(['referredId']),
    (0, typeorm_1.Index)(['referrerId'])
], Referral);
//# sourceMappingURL=referral.entity.js.map