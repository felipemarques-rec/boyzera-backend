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
exports.UserRaffleTask = exports.UserRaffleTaskStatus = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const raffle_task_entity_1 = require("./raffle-task.entity");
const raffle_entity_1 = require("./raffle.entity");
var UserRaffleTaskStatus;
(function (UserRaffleTaskStatus) {
    UserRaffleTaskStatus["PENDING"] = "PENDING";
    UserRaffleTaskStatus["VERIFYING"] = "VERIFYING";
    UserRaffleTaskStatus["COMPLETED"] = "COMPLETED";
    UserRaffleTaskStatus["FAILED"] = "FAILED";
    UserRaffleTaskStatus["REJECTED"] = "REJECTED";
})(UserRaffleTaskStatus || (exports.UserRaffleTaskStatus = UserRaffleTaskStatus = {}));
let UserRaffleTask = class UserRaffleTask {
    id;
    userId;
    user;
    taskId;
    task;
    raffleId;
    raffle;
    status;
    verificationData;
    verifiedAt;
    ticketsClaimed;
    failureReason;
    createdAt;
};
exports.UserRaffleTask = UserRaffleTask;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], UserRaffleTask.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UserRaffleTask.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], UserRaffleTask.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UserRaffleTask.prototype, "taskId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => raffle_task_entity_1.RaffleTask, (task) => task.userTasks),
    (0, typeorm_1.JoinColumn)({ name: 'taskId' }),
    __metadata("design:type", raffle_task_entity_1.RaffleTask)
], UserRaffleTask.prototype, "task", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UserRaffleTask.prototype, "raffleId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => raffle_entity_1.Raffle),
    (0, typeorm_1.JoinColumn)({ name: 'raffleId' }),
    __metadata("design:type", raffle_entity_1.Raffle)
], UserRaffleTask.prototype, "raffle", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: UserRaffleTaskStatus,
        default: UserRaffleTaskStatus.PENDING,
    }),
    __metadata("design:type", String)
], UserRaffleTask.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], UserRaffleTask.prototype, "verificationData", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], UserRaffleTask.prototype, "verifiedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], UserRaffleTask.prototype, "ticketsClaimed", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], UserRaffleTask.prototype, "failureReason", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], UserRaffleTask.prototype, "createdAt", void 0);
exports.UserRaffleTask = UserRaffleTask = __decorate([
    (0, typeorm_1.Entity)('user_raffle_tasks'),
    (0, typeorm_1.Index)(['userId', 'taskId'], { unique: true })
], UserRaffleTask);
//# sourceMappingURL=user-raffle-task.entity.js.map