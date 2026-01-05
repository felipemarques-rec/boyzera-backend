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
exports.MissionController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const get_missions_use_case_1 = require("../../use-cases/mission/get-missions.use-case");
const claim_mission_reward_use_case_1 = require("../../use-cases/mission/claim-mission-reward.use-case");
const mission_entity_1 = require("../../domain/entities/mission.entity");
let MissionController = class MissionController {
    getMissionsUseCase;
    claimMissionRewardUseCase;
    constructor(getMissionsUseCase, claimMissionRewardUseCase) {
        this.getMissionsUseCase = getMissionsUseCase;
        this.claimMissionRewardUseCase = claimMissionRewardUseCase;
    }
    async getMissions(req, type) {
        return this.getMissionsUseCase.execute(req.user.id, type);
    }
    async getDailyMissions(req) {
        return this.getMissionsUseCase.getDailyMissions(req.user.id);
    }
    async getWeeklyMissions(req) {
        return this.getMissionsUseCase.getWeeklyMissions(req.user.id);
    }
    async getAchievements(req) {
        return this.getMissionsUseCase.getAchievements(req.user.id);
    }
    async claimReward(req, missionId) {
        return this.claimMissionRewardUseCase.execute(req.user.id, missionId);
    }
    async claimAllRewards(req) {
        return this.claimMissionRewardUseCase.claimAllCompleted(req.user.id);
    }
};
exports.MissionController = MissionController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MissionController.prototype, "getMissions", null);
__decorate([
    (0, common_1.Get)('daily'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MissionController.prototype, "getDailyMissions", null);
__decorate([
    (0, common_1.Get)('weekly'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MissionController.prototype, "getWeeklyMissions", null);
__decorate([
    (0, common_1.Get)('achievements'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MissionController.prototype, "getAchievements", null);
__decorate([
    (0, common_1.Post)(':id/claim'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MissionController.prototype, "claimReward", null);
__decorate([
    (0, common_1.Post)('claim-all'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MissionController.prototype, "claimAllRewards", null);
exports.MissionController = MissionController = __decorate([
    (0, common_1.Controller)('missions'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [get_missions_use_case_1.GetMissionsUseCase,
        claim_mission_reward_use_case_1.ClaimMissionRewardUseCase])
], MissionController);
//# sourceMappingURL=mission.controller.js.map