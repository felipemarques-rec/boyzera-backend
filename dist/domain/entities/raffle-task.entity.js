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
exports.RaffleTask = exports.RaffleTaskStatus = exports.RaffleTaskType = void 0;
const typeorm_1 = require("typeorm");
const raffle_entity_1 = require("./raffle.entity");
const user_raffle_task_entity_1 = require("./user-raffle-task.entity");
var RaffleTaskType;
(function (RaffleTaskType) {
    RaffleTaskType["INSTAGRAM_FOLLOW"] = "INSTAGRAM_FOLLOW";
    RaffleTaskType["INSTAGRAM_LIKE"] = "INSTAGRAM_LIKE";
    RaffleTaskType["INSTAGRAM_COMMENT"] = "INSTAGRAM_COMMENT";
    RaffleTaskType["TWITTER_FOLLOW"] = "TWITTER_FOLLOW";
    RaffleTaskType["TWITTER_RETWEET"] = "TWITTER_RETWEET";
    RaffleTaskType["TWITTER_LIKE"] = "TWITTER_LIKE";
    RaffleTaskType["YOUTUBE_SUBSCRIBE"] = "YOUTUBE_SUBSCRIBE";
    RaffleTaskType["YOUTUBE_LIKE"] = "YOUTUBE_LIKE";
    RaffleTaskType["TELEGRAM_JOIN"] = "TELEGRAM_JOIN";
    RaffleTaskType["DISCORD_JOIN"] = "DISCORD_JOIN";
    RaffleTaskType["MANUAL_VERIFICATION"] = "MANUAL_VERIFICATION";
})(RaffleTaskType || (exports.RaffleTaskType = RaffleTaskType = {}));
var RaffleTaskStatus;
(function (RaffleTaskStatus) {
    RaffleTaskStatus["ACTIVE"] = "ACTIVE";
    RaffleTaskStatus["INACTIVE"] = "INACTIVE";
})(RaffleTaskStatus || (exports.RaffleTaskStatus = RaffleTaskStatus = {}));
let RaffleTask = class RaffleTask {
    id;
    raffleId;
    raffle;
    type;
    title;
    description;
    iconUrl;
    targetUrl;
    targetUsername;
    targetPostId;
    ticketsReward;
    status;
    sortOrder;
    requiresManualVerification;
    userTasks;
    createdAt;
};
exports.RaffleTask = RaffleTask;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], RaffleTask.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], RaffleTask.prototype, "raffleId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => raffle_entity_1.Raffle, (raffle) => raffle.tasks),
    (0, typeorm_1.JoinColumn)({ name: 'raffleId' }),
    __metadata("design:type", raffle_entity_1.Raffle)
], RaffleTask.prototype, "raffle", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: RaffleTaskType,
    }),
    __metadata("design:type", String)
], RaffleTask.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], RaffleTask.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], RaffleTask.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], RaffleTask.prototype, "iconUrl", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], RaffleTask.prototype, "targetUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], RaffleTask.prototype, "targetUsername", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], RaffleTask.prototype, "targetPostId", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1 }),
    __metadata("design:type", Number)
], RaffleTask.prototype, "ticketsReward", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: RaffleTaskStatus,
        default: RaffleTaskStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], RaffleTask.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], RaffleTask.prototype, "sortOrder", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], RaffleTask.prototype, "requiresManualVerification", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_raffle_task_entity_1.UserRaffleTask, (userTask) => userTask.task),
    __metadata("design:type", Array)
], RaffleTask.prototype, "userTasks", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], RaffleTask.prototype, "createdAt", void 0);
exports.RaffleTask = RaffleTask = __decorate([
    (0, typeorm_1.Entity)('raffle_tasks')
], RaffleTask);
//# sourceMappingURL=raffle-task.entity.js.map