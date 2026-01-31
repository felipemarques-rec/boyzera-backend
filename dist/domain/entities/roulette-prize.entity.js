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
exports.RoulettePrize = exports.RoulettePrizeType = void 0;
const typeorm_1 = require("typeorm");
var RoulettePrizeType;
(function (RoulettePrizeType) {
    RoulettePrizeType["FOLLOWERS"] = "FOLLOWERS";
    RoulettePrizeType["GEMS"] = "GEMS";
    RoulettePrizeType["ENERGY"] = "ENERGY";
    RoulettePrizeType["BOOSTER"] = "BOOSTER";
    RoulettePrizeType["COSMETIC"] = "COSMETIC";
    RoulettePrizeType["SPECIAL"] = "SPECIAL";
})(RoulettePrizeType || (exports.RoulettePrizeType = RoulettePrizeType = {}));
let RoulettePrize = class RoulettePrize {
    id;
    name;
    description;
    type;
    reward;
    probability;
    imageUrl;
    color;
    sortOrder;
    isActive;
    isExclusive;
    createdAt;
    updatedAt;
};
exports.RoulettePrize = RoulettePrize;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], RoulettePrize.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], RoulettePrize.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], RoulettePrize.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: RoulettePrizeType,
        default: RoulettePrizeType.FOLLOWERS,
    }),
    __metadata("design:type", String)
], RoulettePrize.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], RoulettePrize.prototype, "reward", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', default: 1 }),
    __metadata("design:type", Number)
], RoulettePrize.prototype, "probability", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], RoulettePrize.prototype, "imageUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], RoulettePrize.prototype, "color", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], RoulettePrize.prototype, "sortOrder", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], RoulettePrize.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], RoulettePrize.prototype, "isExclusive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], RoulettePrize.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], RoulettePrize.prototype, "updatedAt", void 0);
exports.RoulettePrize = RoulettePrize = __decorate([
    (0, typeorm_1.Entity)('roulette_prizes')
], RoulettePrize);
//# sourceMappingURL=roulette-prize.entity.js.map