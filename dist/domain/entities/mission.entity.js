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
exports.Mission = exports.MissionRequirementType = exports.MissionType = void 0;
const typeorm_1 = require("typeorm");
var MissionType;
(function (MissionType) {
    MissionType["DAILY"] = "daily";
    MissionType["WEEKLY"] = "weekly";
    MissionType["ACHIEVEMENT"] = "achievement";
})(MissionType || (exports.MissionType = MissionType = {}));
var MissionRequirementType;
(function (MissionRequirementType) {
    MissionRequirementType["TAP_COUNT"] = "tap_count";
    MissionRequirementType["FOLLOWER_COUNT"] = "follower_count";
    MissionRequirementType["LEVEL_REACH"] = "level_reach";
    MissionRequirementType["UPGRADE_BUY"] = "upgrade_buy";
    MissionRequirementType["REFERRAL_COUNT"] = "referral_count";
    MissionRequirementType["COMBO_REACH"] = "combo_reach";
    MissionRequirementType["LOGIN_STREAK"] = "login_streak";
    MissionRequirementType["WATCH_ADS"] = "watch_ads";
    MissionRequirementType["CHALLENGE_WIN"] = "challenge_win";
    MissionRequirementType["COLLAB_COMPLETE"] = "collab_complete";
})(MissionRequirementType || (exports.MissionRequirementType = MissionRequirementType = {}));
let Mission = class Mission {
    id;
    type;
    title;
    description;
    requirement;
    reward;
    iconName;
    imageUrl;
    sortOrder;
    isActive;
    requiredLevel;
    createdAt;
    updatedAt;
};
exports.Mission = Mission;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Mission.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: MissionType,
    }),
    __metadata("design:type", String)
], Mission.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Mission.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Mission.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Object)
], Mission.prototype, "requirement", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Object)
], Mission.prototype, "reward", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Mission.prototype, "iconName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Mission.prototype, "imageUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Mission.prototype, "sortOrder", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Mission.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1 }),
    __metadata("design:type", Number)
], Mission.prototype, "requiredLevel", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Mission.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Mission.prototype, "updatedAt", void 0);
exports.Mission = Mission = __decorate([
    (0, typeorm_1.Entity)('missions'),
    (0, typeorm_1.Index)(['type']),
    (0, typeorm_1.Index)(['isActive'])
], Mission);
//# sourceMappingURL=mission.entity.js.map