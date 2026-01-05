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
exports.Season = exports.SeasonStatus = void 0;
const typeorm_1 = require("typeorm");
var SeasonStatus;
(function (SeasonStatus) {
    SeasonStatus["UPCOMING"] = "upcoming";
    SeasonStatus["ACTIVE"] = "active";
    SeasonStatus["ENDED"] = "ended";
})(SeasonStatus || (exports.SeasonStatus = SeasonStatus = {}));
let Season = class Season {
    id;
    name;
    description;
    status;
    startDate;
    endDate;
    prizePool;
    seasonNumber;
    bannerUrl;
    themeColor;
    rewardsDistributed;
    rewardsDistributedAt;
    createdAt;
    updatedAt;
    isActive() {
        const now = new Date();
        return (this.status === SeasonStatus.ACTIVE &&
            now >= this.startDate &&
            now <= this.endDate);
    }
    isUpcoming() {
        const now = new Date();
        return this.status === SeasonStatus.UPCOMING && now < this.startDate;
    }
    hasEnded() {
        const now = new Date();
        return this.status === SeasonStatus.ENDED || now > this.endDate;
    }
    getDaysRemaining() {
        const now = new Date();
        if (now > this.endDate)
            return 0;
        const diff = this.endDate.getTime() - now.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }
    getProgressPercentage() {
        const now = new Date();
        if (now < this.startDate)
            return 0;
        if (now > this.endDate)
            return 100;
        const total = this.endDate.getTime() - this.startDate.getTime();
        const elapsed = now.getTime() - this.startDate.getTime();
        return Math.round((elapsed / total) * 100);
    }
};
exports.Season = Season;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Season.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Season.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Season.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: SeasonStatus,
        default: SeasonStatus.UPCOMING,
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Season.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Date)
], Season.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Date)
], Season.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Object)
], Season.prototype, "prizePool", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], Season.prototype, "seasonNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Season.prototype, "bannerUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Season.prototype, "themeColor", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Season.prototype, "rewardsDistributed", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Season.prototype, "rewardsDistributedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Season.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Season.prototype, "updatedAt", void 0);
exports.Season = Season = __decorate([
    (0, typeorm_1.Entity)('seasons')
], Season);
//# sourceMappingURL=season.entity.js.map