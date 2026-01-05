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
exports.Upgrade = exports.UpgradeEffectType = exports.UpgradeCategory = void 0;
const typeorm_1 = require("typeorm");
const bigint_transformer_1 = require("../../shared/utils/bigint.transformer");
var UpgradeCategory;
(function (UpgradeCategory) {
    UpgradeCategory["VEHICLE"] = "vehicle";
    UpgradeCategory["HOUSE"] = "house";
    UpgradeCategory["EQUIPMENT"] = "equipment";
    UpgradeCategory["STYLE"] = "style";
    UpgradeCategory["EDUCATION"] = "education";
})(UpgradeCategory || (exports.UpgradeCategory = UpgradeCategory = {}));
var UpgradeEffectType;
(function (UpgradeEffectType) {
    UpgradeEffectType["TAP_MULTIPLIER"] = "tap_multiplier";
    UpgradeEffectType["ENERGY_MAX"] = "energy_max";
    UpgradeEffectType["ENERGY_REGEN"] = "energy_regen";
    UpgradeEffectType["PASSIVE_INCOME"] = "passive_income";
})(UpgradeEffectType || (exports.UpgradeEffectType = UpgradeEffectType = {}));
let Upgrade = class Upgrade {
    id;
    name;
    description;
    category;
    effectType;
    baseCost;
    baseEffect;
    costMultiplier;
    effectMultiplier;
    requiredLevel;
    maxLevel;
    imageUrl;
    iconName;
    sortOrder;
    isActive;
    getCostAtLevel(level) {
        if (level <= 0)
            return this.baseCost;
        return BigInt(Math.floor(Number(this.baseCost) * Math.pow(this.costMultiplier, level)));
    }
    getEffectAtLevel(level) {
        if (level <= 0)
            return 0;
        return this.baseEffect * Math.pow(this.effectMultiplier, level - 1);
    }
};
exports.Upgrade = Upgrade;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Upgrade.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Upgrade.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Upgrade.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: UpgradeCategory,
        default: UpgradeCategory.EQUIPMENT,
    }),
    __metadata("design:type", String)
], Upgrade.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: UpgradeEffectType,
        default: UpgradeEffectType.PASSIVE_INCOME,
    }),
    __metadata("design:type", String)
], Upgrade.prototype, "effectType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'bigint',
        transformer: bigint_transformer_1.bigintTransformer,
    }),
    __metadata("design:type", BigInt)
], Upgrade.prototype, "baseCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float' }),
    __metadata("design:type", Number)
], Upgrade.prototype, "baseEffect", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', default: 1.15 }),
    __metadata("design:type", Number)
], Upgrade.prototype, "costMultiplier", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', default: 1.1 }),
    __metadata("design:type", Number)
], Upgrade.prototype, "effectMultiplier", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1 }),
    __metadata("design:type", Number)
], Upgrade.prototype, "requiredLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 100 }),
    __metadata("design:type", Number)
], Upgrade.prototype, "maxLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Upgrade.prototype, "imageUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Upgrade.prototype, "iconName", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Upgrade.prototype, "sortOrder", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Upgrade.prototype, "isActive", void 0);
exports.Upgrade = Upgrade = __decorate([
    (0, typeorm_1.Entity)('upgrades'),
    (0, typeorm_1.Index)(['category']),
    (0, typeorm_1.Index)(['requiredLevel'])
], Upgrade);
//# sourceMappingURL=upgrade.entity.js.map