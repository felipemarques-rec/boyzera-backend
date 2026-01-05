"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const notification_entity_1 = require("../../domain/entities/notification.entity");
const create_notification_use_case_1 = require("../../use-cases/notification/create-notification.use-case");
const get_notifications_use_case_1 = require("../../use-cases/notification/get-notifications.use-case");
const mark_as_read_use_case_1 = require("../../use-cases/notification/mark-as-read.use-case");
const notification_controller_1 = require("../../presentation/controllers/notification.controller");
const notification_listener_1 = require("../listeners/notification.listener");
let NotificationModule = class NotificationModule {
};
exports.NotificationModule = NotificationModule;
exports.NotificationModule = NotificationModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([notification_entity_1.Notification])],
        providers: [
            create_notification_use_case_1.CreateNotificationUseCase,
            get_notifications_use_case_1.GetNotificationsUseCase,
            mark_as_read_use_case_1.MarkAsReadUseCase,
            notification_listener_1.NotificationListener,
        ],
        controllers: [notification_controller_1.NotificationController],
        exports: [create_notification_use_case_1.CreateNotificationUseCase],
    })
], NotificationModule);
//# sourceMappingURL=notification.module.js.map