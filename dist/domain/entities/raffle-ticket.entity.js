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
exports.RaffleTicket = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const raffle_entity_1 = require("./raffle.entity");
const raffle_task_entity_1 = require("./raffle-task.entity");
let RaffleTicket = class RaffleTicket {
    id;
    userId;
    user;
    raffleId;
    raffle;
    taskId;
    task;
    ticketNumber;
    isWinner;
    wonAt;
    createdAt;
};
exports.RaffleTicket = RaffleTicket;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], RaffleTicket.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], RaffleTicket.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], RaffleTicket.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], RaffleTicket.prototype, "raffleId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => raffle_entity_1.Raffle, (raffle) => raffle.tickets),
    (0, typeorm_1.JoinColumn)({ name: 'raffleId' }),
    __metadata("design:type", raffle_entity_1.Raffle)
], RaffleTicket.prototype, "raffle", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], RaffleTicket.prototype, "taskId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => raffle_task_entity_1.RaffleTask, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'taskId' }),
    __metadata("design:type", raffle_task_entity_1.RaffleTask)
], RaffleTicket.prototype, "task", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], RaffleTicket.prototype, "ticketNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], RaffleTicket.prototype, "isWinner", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], RaffleTicket.prototype, "wonAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], RaffleTicket.prototype, "createdAt", void 0);
exports.RaffleTicket = RaffleTicket = __decorate([
    (0, typeorm_1.Entity)('raffle_tickets'),
    (0, typeorm_1.Index)(['userId', 'raffleId'])
], RaffleTicket);
//# sourceMappingURL=raffle-ticket.entity.js.map