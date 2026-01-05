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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReferralController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const get_referral_link_use_case_1 = require("../../use-cases/referral/get-referral-link.use-case");
const process_referral_use_case_1 = require("../../use-cases/referral/process-referral.use-case");
const get_referral_stats_use_case_1 = require("../../use-cases/referral/get-referral-stats.use-case");
class ProcessReferralDto {
    referralCode;
}
let ReferralController = class ReferralController {
    getReferralLinkUseCase;
    processReferralUseCase;
    getReferralStatsUseCase;
    constructor(getReferralLinkUseCase, processReferralUseCase, getReferralStatsUseCase) {
        this.getReferralLinkUseCase = getReferralLinkUseCase;
        this.processReferralUseCase = processReferralUseCase;
        this.getReferralStatsUseCase = getReferralStatsUseCase;
    }
    async getReferralLink(req) {
        return this.getReferralLinkUseCase.execute(req.user.id);
    }
    async getReferralStats(req) {
        return this.getReferralStatsUseCase.execute(req.user.id);
    }
    async getReferralLeaderboard(limit = 50) {
        return this.getReferralStatsUseCase.getReferralLeaderboard(limit);
    }
    async processReferral(req, dto) {
        return this.processReferralUseCase.execute(req.user.id, dto.referralCode);
    }
};
exports.ReferralController = ReferralController;
__decorate([
    (0, common_1.Get)('link'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReferralController.prototype, "getReferralLink", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReferralController.prototype, "getReferralStats", null);
__decorate([
    (0, common_1.Get)('leaderboard'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ReferralController.prototype, "getReferralLeaderboard", null);
__decorate([
    (0, common_1.Post)('process'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, ProcessReferralDto]),
    __metadata("design:returntype", Promise)
], ReferralController.prototype, "processReferral", null);
exports.ReferralController = ReferralController = __decorate([
    (0, common_1.Controller)('referral'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [get_referral_link_use_case_1.GetReferralLinkUseCase,
        process_referral_use_case_1.ProcessReferralUseCase,
        get_referral_stats_use_case_1.GetReferralStatsUseCase])
], ReferralController);
//# sourceMappingURL=referral.controller.js.map