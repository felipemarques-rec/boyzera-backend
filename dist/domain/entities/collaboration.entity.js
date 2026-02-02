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
exports.Collaboration = exports.CollaborationStatus = exports.CollaborationType = void 0;
const typeorm_1 = require("typeorm");
const bigint_transformer_1 = require("../../shared/utils/bigint.transformer");
var CollaborationType;
(function (CollaborationType) {
    CollaborationType["BRAND"] = "BRAND";
    CollaborationType["INFLUENCER"] = "INFLUENCER";
    CollaborationType["MUSIC"] = "MUSIC";
    CollaborationType["EVENT"] = "EVENT";
})(CollaborationType || (exports.CollaborationType = CollaborationType = {}));
var CollaborationStatus;
(function (CollaborationStatus) {
    CollaborationStatus["AVAILABLE"] = "AVAILABLE";
    CollaborationStatus["IN_PROGRESS"] = "IN_PROGRESS";
    CollaborationStatus["COMPLETED"] = "COMPLETED";
    CollaborationStatus["EXPIRED"] = "EXPIRED";
})(CollaborationStatus || (exports.CollaborationStatus = CollaborationStatus = {}));
let Collaboration = class Collaboration {
    id;
    title;
    description;
    type;
    brandName;
    brandLogo;
    imageUrl;
    followersReward;
    gemsReward;
    engagementBonus;
    requiredLevel;
    durationMinutes;
    expiresAt;
    maxParticipants;
    currentParticipants;
    isActive;
    sortOrder;
    createdAt;
    updatedAt;
};
exports.Collaboration = Collaboration;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Collaboration.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Collaboration.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Collaboration.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: CollaborationType,
        default: CollaborationType.BRAND,
    }),
    __metadata("design:type", String)
], Collaboration.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Collaboration.prototype, "brandName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Collaboration.prototype, "brandLogo", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Collaboration.prototype, "imageUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'bigint',
        default: 0,
        transformer: bigint_transformer_1.bigintTransformer,
    }),
    __metadata("design:type", BigInt)
], Collaboration.prototype, "followersReward", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Collaboration.prototype, "gemsReward", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Collaboration.prototype, "engagementBonus", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1 }),
    __metadata("design:type", Number)
], Collaboration.prototype, "requiredLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Collaboration.prototype, "durationMinutes", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Collaboration.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Collaboration.prototype, "maxParticipants", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Collaboration.prototype, "currentParticipants", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Collaboration.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Collaboration.prototype, "sortOrder", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Collaboration.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Collaboration.prototype, "updatedAt", void 0);
exports.Collaboration = Collaboration = __decorate([
    (0, typeorm_1.Entity)('collaborations')
], Collaboration);
//# sourceMappingURL=collaboration.entity.js.map