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
exports.CreateNotificationUseCase = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const notification_entity_1 = require("../../domain/entities/notification.entity");
let CreateNotificationUseCase = class CreateNotificationUseCase {
    notificationRepository;
    constructor(notificationRepository) {
        this.notificationRepository = notificationRepository;
    }
    async execute(dto) {
        const notification = this.notificationRepository.create({
            userId: dto.userId,
            type: dto.type,
            title: dto.title,
            message: dto.message,
            iconName: dto.iconName,
            data: dto.data,
            actionUrl: dto.actionUrl,
            isRead: false,
        });
        return this.notificationRepository.save(notification);
    }
    async createLevelUpNotification(userId, newLevel, rewards) {
        return this.execute({
            userId,
            type: notification_entity_1.NotificationType.LEVEL_UP,
            title: 'Level Up!',
            message: `Parabens! Voce alcancou o nivel ${newLevel}!`,
            iconName: 'level-up',
            data: { level: newLevel, rewards },
        });
    }
    async createMissionCompleteNotification(userId, missionTitle, reward) {
        return this.execute({
            userId,
            type: notification_entity_1.NotificationType.MISSION_COMPLETE,
            title: 'Missao Concluida!',
            message: `Voce completou: ${missionTitle}`,
            iconName: 'mission-complete',
            data: { missionTitle, reward },
            actionUrl: '/missions',
        });
    }
    async createReferralBonusNotification(userId, referredUsername, bonus) {
        return this.execute({
            userId,
            type: notification_entity_1.NotificationType.REFERRAL_BONUS,
            title: 'Novo Indicado!',
            message: `${referredUsername || 'Alguem'} entrou pelo seu link! +${bonus} seguidores`,
            iconName: 'referral',
            data: { referredUsername, bonus },
            actionUrl: '/friends',
        });
    }
    async createEnergyFullNotification(userId) {
        return this.execute({
            userId,
            type: notification_entity_1.NotificationType.ENERGY_FULL,
            title: 'Energia Cheia!',
            message: 'Sua energia esta cheia! Hora de fazer taps!',
            iconName: 'energy',
        });
    }
    async createDailyRewardNotification(userId, streak, reward) {
        return this.execute({
            userId,
            type: notification_entity_1.NotificationType.DAILY_REWARD,
            title: 'Recompensa Diaria!',
            message: `Dia ${streak} de login consecutivo!`,
            iconName: 'daily-reward',
            data: { streak, reward },
        });
    }
    async createSystemNotification(userId, title, message) {
        return this.execute({
            userId,
            type: notification_entity_1.NotificationType.SYSTEM,
            title,
            message,
            iconName: 'system',
        });
    }
    async createBulkNotification(userIds, type, title, message, data) {
        const notifications = userIds.map((userId) => this.notificationRepository.create({
            userId,
            type,
            title,
            message,
            data,
            isRead: false,
        }));
        return this.notificationRepository.save(notifications);
    }
};
exports.CreateNotificationUseCase = CreateNotificationUseCase;
exports.CreateNotificationUseCase = CreateNotificationUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CreateNotificationUseCase);
//# sourceMappingURL=create-notification.use-case.js.map