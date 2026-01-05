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
exports.MarkAsReadUseCase = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const notification_entity_1 = require("../../domain/entities/notification.entity");
let MarkAsReadUseCase = class MarkAsReadUseCase {
    notificationRepository;
    constructor(notificationRepository) {
        this.notificationRepository = notificationRepository;
    }
    async execute(userId, notificationId) {
        const notification = await this.notificationRepository.findOne({
            where: { id: notificationId, userId },
        });
        if (!notification) {
            throw new common_1.BadRequestException('Notification not found');
        }
        if (notification.isRead) {
            return notification;
        }
        notification.isRead = true;
        notification.readAt = new Date();
        return this.notificationRepository.save(notification);
    }
    async markMultipleAsRead(userId, notificationIds) {
        const result = await this.notificationRepository.update({
            id: (0, typeorm_2.In)(notificationIds),
            userId,
            isRead: false,
        }, {
            isRead: true,
            readAt: new Date(),
        });
        return result.affected || 0;
    }
    async markAllAsRead(userId) {
        const result = await this.notificationRepository.update({
            userId,
            isRead: false,
        }, {
            isRead: true,
            readAt: new Date(),
        });
        return result.affected || 0;
    }
};
exports.MarkAsReadUseCase = MarkAsReadUseCase;
exports.MarkAsReadUseCase = MarkAsReadUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], MarkAsReadUseCase);
//# sourceMappingURL=mark-as-read.use-case.js.map