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
exports.GetNotificationsUseCase = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const notification_entity_1 = require("../../domain/entities/notification.entity");
let GetNotificationsUseCase = class GetNotificationsUseCase {
    notificationRepository;
    constructor(notificationRepository) {
        this.notificationRepository = notificationRepository;
    }
    async execute(userId, options = {}) {
        const { limit = 50, offset = 0, unreadOnly = false } = options;
        const whereCondition = { userId };
        if (unreadOnly) {
            whereCondition.isRead = false;
        }
        const [notifications, total] = await this.notificationRepository.findAndCount({
            where: whereCondition,
            relations: ['character'],
            order: { createdAt: 'DESC' },
            take: limit,
            skip: offset,
        });
        const unreadCount = await this.notificationRepository.count({
            where: { userId, isRead: false },
        });
        return {
            notifications: notifications.map((n) => ({
                id: n.id,
                type: n.type,
                title: n.title,
                message: n.message,
                iconName: n.iconName,
                data: n.data,
                actionUrl: n.actionUrl,
                isRead: n.isRead,
                createdAt: n.createdAt,
                character: n.character
                    ? {
                        id: n.character.id,
                        name: n.character.name,
                        displayName: n.character.displayName || n.character.name,
                        avatarUrl: n.character.avatarUrl,
                        area: n.character.area,
                        customColors: n.character.customColors,
                    }
                    : null,
            })),
            total,
            unreadCount,
        };
    }
    async getUnreadCount(userId) {
        return this.notificationRepository.count({
            where: { userId, isRead: false },
        });
    }
    async cleanOldNotifications(daysOld = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);
        const result = await this.notificationRepository.delete({
            createdAt: (0, typeorm_2.LessThan)(cutoffDate),
            isRead: true,
        });
        return result.affected || 0;
    }
};
exports.GetNotificationsUseCase = GetNotificationsUseCase;
exports.GetNotificationsUseCase = GetNotificationsUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], GetNotificationsUseCase);
//# sourceMappingURL=get-notifications.use-case.js.map