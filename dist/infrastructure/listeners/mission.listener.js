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
exports.MissionListener = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const update_mission_progress_use_case_1 = require("../../use-cases/mission/update-mission-progress.use-case");
const mission_entity_1 = require("../../domain/entities/mission.entity");
let MissionListener = class MissionListener {
    updateMissionProgressUseCase;
    constructor(updateMissionProgressUseCase) {
        this.updateMissionProgressUseCase = updateMissionProgressUseCase;
    }
    async handleTapEvent(payload) {
        const { userId, tapCount, totalFollowers, combo } = payload;
        await this.updateMissionProgressUseCase.execute(userId, mission_entity_1.MissionRequirementType.TAP_COUNT, tapCount);
        await this.updateMissionProgressUseCase.execute(userId, mission_entity_1.MissionRequirementType.FOLLOWER_COUNT, 0, Number(totalFollowers));
        await this.updateMissionProgressUseCase.execute(userId, mission_entity_1.MissionRequirementType.COMBO_REACH, 0, combo);
    }
    async handleLevelUpEvent(payload) {
        const { userId, newLevel } = payload;
        await this.updateMissionProgressUseCase.execute(userId, mission_entity_1.MissionRequirementType.LEVEL_REACH, 0, newLevel);
    }
    async handleUpgradeEvent(payload) {
        const { userId } = payload;
        await this.updateMissionProgressUseCase.execute(userId, mission_entity_1.MissionRequirementType.UPGRADE_BUY, 1);
    }
    async handleReferralEvent(payload) {
        const { userId, totalReferrals } = payload;
        await this.updateMissionProgressUseCase.execute(userId, mission_entity_1.MissionRequirementType.REFERRAL_COUNT, 0, totalReferrals);
    }
    async handleChallengeEvent(payload) {
        const { userId, won, totalWins } = payload;
        if (won) {
            await this.updateMissionProgressUseCase.execute(userId, mission_entity_1.MissionRequirementType.CHALLENGE_WIN, 0, totalWins);
        }
    }
    async handleLoginEvent(payload) {
        const { userId, streak } = payload;
        await this.updateMissionProgressUseCase.execute(userId, mission_entity_1.MissionRequirementType.LOGIN_STREAK, 0, streak);
    }
    async handleAdWatchedEvent(payload) {
        const { userId } = payload;
        await this.updateMissionProgressUseCase.execute(userId, mission_entity_1.MissionRequirementType.WATCH_ADS, 1);
    }
    async handleCollabEvent(payload) {
        const { userId } = payload;
        await this.updateMissionProgressUseCase.execute(userId, mission_entity_1.MissionRequirementType.COLLAB_COMPLETE, 1);
    }
};
exports.MissionListener = MissionListener;
__decorate([
    (0, event_emitter_1.OnEvent)('game.tap'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MissionListener.prototype, "handleTapEvent", null);
__decorate([
    (0, event_emitter_1.OnEvent)('game.levelUp'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MissionListener.prototype, "handleLevelUpEvent", null);
__decorate([
    (0, event_emitter_1.OnEvent)('game.upgrade'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MissionListener.prototype, "handleUpgradeEvent", null);
__decorate([
    (0, event_emitter_1.OnEvent)('referral.new'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MissionListener.prototype, "handleReferralEvent", null);
__decorate([
    (0, event_emitter_1.OnEvent)('challenge.completed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MissionListener.prototype, "handleChallengeEvent", null);
__decorate([
    (0, event_emitter_1.OnEvent)('user.login'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MissionListener.prototype, "handleLoginEvent", null);
__decorate([
    (0, event_emitter_1.OnEvent)('ad.watched'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MissionListener.prototype, "handleAdWatchedEvent", null);
__decorate([
    (0, event_emitter_1.OnEvent)('collab.completed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MissionListener.prototype, "handleCollabEvent", null);
exports.MissionListener = MissionListener = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [update_mission_progress_use_case_1.UpdateMissionProgressUseCase])
], MissionListener);
//# sourceMappingURL=mission.listener.js.map