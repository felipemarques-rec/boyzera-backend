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
exports.Raffle = exports.RafflePrizeType = exports.RaffleStatus = void 0;
const typeorm_1 = require("typeorm");
const raffle_ticket_entity_1 = require("./raffle-ticket.entity");
const raffle_task_entity_1 = require("./raffle-task.entity");
var RaffleStatus;
(function (RaffleStatus) {
    RaffleStatus["UPCOMING"] = "UPCOMING";
    RaffleStatus["ACTIVE"] = "ACTIVE";
    RaffleStatus["DRAWING"] = "DRAWING";
    RaffleStatus["COMPLETED"] = "COMPLETED";
    RaffleStatus["CANCELLED"] = "CANCELLED";
})(RaffleStatus || (exports.RaffleStatus = RaffleStatus = {}));
var RafflePrizeType;
(function (RafflePrizeType) {
    RafflePrizeType["FOLLOWERS"] = "FOLLOWERS";
    RafflePrizeType["GEMS"] = "GEMS";
    RafflePrizeType["TOKENS"] = "TOKENS";
    RafflePrizeType["PHYSICAL_ITEM"] = "PHYSICAL_ITEM";
    RafflePrizeType["IN_GAME_ITEM"] = "IN_GAME_ITEM";
    RafflePrizeType["EXCLUSIVE_SKIN"] = "EXCLUSIVE_SKIN";
})(RafflePrizeType || (exports.RafflePrizeType = RafflePrizeType = {}));
let Raffle = class Raffle {
    id;
    title;
    description;
    imageUrl;
    bannerUrl;
    status;
    prizeType;
    prizeName;
    prizeDescription;
    prizeImageUrl;
    prizeFollowersAmount;
    prizeGemsAmount;
    prizeTokensAmount;
    startsAt;
    endsAt;
    drawAt;
    maxTicketsPerUser;
    totalTickets;
    numberOfWinners;
    requiredLevel;
    isActive;
    sortOrder;
    winnerId;
    winnerIds;
    tickets;
    tasks;
    createdAt;
    updatedAt;
};
exports.Raffle = Raffle;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Raffle.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Raffle.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Raffle.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Raffle.prototype, "imageUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Raffle.prototype, "bannerUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: RaffleStatus,
        default: RaffleStatus.UPCOMING,
    }),
    __metadata("design:type", String)
], Raffle.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: RafflePrizeType,
    }),
    __metadata("design:type", String)
], Raffle.prototype, "prizeType", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Raffle.prototype, "prizeName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Raffle.prototype, "prizeDescription", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Raffle.prototype, "prizeImageUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', default: 0 }),
    __metadata("design:type", BigInt)
], Raffle.prototype, "prizeFollowersAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Raffle.prototype, "prizeGemsAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 8, default: 0 }),
    __metadata("design:type", Number)
], Raffle.prototype, "prizeTokensAmount", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], Raffle.prototype, "startsAt", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], Raffle.prototype, "endsAt", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], Raffle.prototype, "drawAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Raffle.prototype, "maxTicketsPerUser", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Raffle.prototype, "totalTickets", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1 }),
    __metadata("design:type", Number)
], Raffle.prototype, "numberOfWinners", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1 }),
    __metadata("design:type", Number)
], Raffle.prototype, "requiredLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Raffle.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Raffle.prototype, "sortOrder", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Raffle.prototype, "winnerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], Raffle.prototype, "winnerIds", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => raffle_ticket_entity_1.RaffleTicket, (ticket) => ticket.raffle),
    __metadata("design:type", Array)
], Raffle.prototype, "tickets", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => raffle_task_entity_1.RaffleTask, (task) => task.raffle),
    __metadata("design:type", Array)
], Raffle.prototype, "tasks", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Raffle.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Raffle.prototype, "updatedAt", void 0);
exports.Raffle = Raffle = __decorate([
    (0, typeorm_1.Entity)('raffles')
], Raffle);
//# sourceMappingURL=raffle.entity.js.map