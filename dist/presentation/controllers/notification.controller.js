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
exports.NotificationController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const get_notifications_use_case_1 = require("../../use-cases/notification/get-notifications.use-case");
const mark_as_read_use_case_1 = require("../../use-cases/notification/mark-as-read.use-case");
class MarkMultipleDto {
    notificationIds;
}
let NotificationController = class NotificationController {
    getNotificationsUseCase;
    markAsReadUseCase;
    constructor(getNotificationsUseCase, markAsReadUseCase) {
        this.getNotificationsUseCase = getNotificationsUseCase;
        this.markAsReadUseCase = markAsReadUseCase;
    }
    async getNotifications(req, limit, offset, unreadOnly) {
        return this.getNotificationsUseCase.execute(req.user.id, {
            limit: limit || 50,
            offset: offset || 0,
            unreadOnly: unreadOnly === true || unreadOnly === 'true',
        });
    }
    async getUnreadCount(req) {
        const count = await this.getNotificationsUseCase.getUnreadCount(req.user.id);
        return { count };
    }
    async markAsRead(req, notificationId) {
        return this.markAsReadUseCase.execute(req.user.id, notificationId);
    }
    async markMultipleAsRead(req, dto) {
        const count = await this.markAsReadUseCase.markMultipleAsRead(req.user.id, dto.notificationIds);
        return { markedCount: count };
    }
    async markAllAsRead(req) {
        const count = await this.markAsReadUseCase.markAllAsRead(req.user.id);
        return { markedCount: count };
    }
};
exports.NotificationController = NotificationController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('offset')),
    __param(3, (0, common_1.Query)('unreadOnly')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, Boolean]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "getNotifications", null);
__decorate([
    (0, common_1.Get)('unread-count'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "getUnreadCount", null);
__decorate([
    (0, common_1.Post)(':id/read'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.Post)('read-multiple'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, MarkMultipleDto]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "markMultipleAsRead", null);
__decorate([
    (0, common_1.Post)('read-all'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "markAllAsRead", null);
exports.NotificationController = NotificationController = __decorate([
    (0, common_1.Controller)('notifications'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [get_notifications_use_case_1.GetNotificationsUseCase,
        mark_as_read_use_case_1.MarkAsReadUseCase])
], NotificationController);
//# sourceMappingURL=notification.controller.js.map