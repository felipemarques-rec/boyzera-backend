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
exports.Level = void 0;
const typeorm_1 = require("typeorm");
const bigint_transformer_1 = require("../../shared/utils/bigint.transformer");
let Level = class Level {
    value;
    name;
    requiredFollowers;
    maxEnergy;
    energyRegenRate;
    tapMultiplier;
    rewardGems;
    rewardFollowers;
    skinUnlock;
    description;
};
exports.Level = Level;
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", Number)
], Level.prototype, "value", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Level.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'bigint',
        transformer: bigint_transformer_1.bigintTransformer,
    }),
    __metadata("design:type", BigInt)
], Level.prototype, "requiredFollowers", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1000 }),
    __metadata("design:type", Number)
], Level.prototype, "maxEnergy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', default: 1 }),
    __metadata("design:type", Number)
], Level.prototype, "energyRegenRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1 }),
    __metadata("design:type", Number)
], Level.prototype, "tapMultiplier", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Level.prototype, "rewardGems", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'bigint',
        default: 0,
        transformer: bigint_transformer_1.bigintTransformer,
    }),
    __metadata("design:type", BigInt)
], Level.prototype, "rewardFollowers", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Level.prototype, "skinUnlock", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Level.prototype, "description", void 0);
exports.Level = Level = __decorate([
    (0, typeorm_1.Entity)('levels')
], Level);
//# sourceMappingURL=level.entity.js.map