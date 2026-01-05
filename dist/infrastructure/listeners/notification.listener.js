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
exports.NotificationListener = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const create_notification_use_case_1 = require("../../use-cases/notification/create-notification.use-case");
let NotificationListener = class NotificationListener {
    createNotificationUseCase;
    constructor(createNotificationUseCase) {
        this.createNotificationUseCase = createNotificationUseCase;
    }
    async handleLevelUpEvent(payload) {
        await this.createNotificationUseCase.createLevelUpNotification(payload.userId, payload.newLevel, {
            gems: payload.rewards.gems,
            followers: payload.rewards.followers.toString(),
        });
    }
    async handleMissionCompleteEvent(payload) {
        await this.createNotificationUseCase.createMissionCompleteNotification(payload.userId, payload.missionTitle, payload.reward);
    }
    async handleReferralEvent(payload) {
        await this.createNotificationUseCase.createReferralBonusNotification(payload.userId, '', '1000');
    }
};
exports.NotificationListener = NotificationListener;
__decorate([
    (0, event_emitter_1.OnEvent)('game.levelUp'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationListener.prototype, "handleLevelUpEvent", null);
__decorate([
    (0, event_emitter_1.OnEvent)('mission.completed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationListener.prototype, "handleMissionCompleteEvent", null);
__decorate([
    (0, event_emitter_1.OnEvent)('referral.new'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationListener.prototype, "handleReferralEvent", null);
exports.NotificationListener = NotificationListener = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [create_notification_use_case_1.CreateNotificationUseCase])
], NotificationListener);
//# sourceMappingURL=notification.listener.js.map