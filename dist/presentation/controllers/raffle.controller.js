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
exports.RaffleController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const raffle_service_1 = require("../../infrastructure/raffle/raffle.service");
let RaffleController = class RaffleController {
    raffleService;
    constructor(raffleService) {
        this.raffleService = raffleService;
    }
    async getActiveRaffles(req) {
        return this.raffleService.getActiveRaffles(req.user.id);
    }
    async getMyTickets(req, raffleId) {
        return this.raffleService.getUserTickets(req.user.id, raffleId);
    }
    async getWinners(raffleId) {
        return this.raffleService.getWinners(raffleId);
    }
    async getRaffleDetails(req, raffleId) {
        return this.raffleService.getRaffleDetails(req.user.id, raffleId);
    }
    async startTask(req, raffleId, taskId) {
        return this.raffleService.startTaskVerification(req.user.id, raffleId, taskId);
    }
    async verifyTask(req, raffleId, taskId) {
        return this.raffleService.verifyTask(req.user.id, raffleId, taskId);
    }
    async claimTickets(req, raffleId, taskId) {
        return this.raffleService.claimTickets(req.user.id, raffleId, taskId);
    }
};
exports.RaffleController = RaffleController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RaffleController.prototype, "getActiveRaffles", null);
__decorate([
    (0, common_1.Get)('my-tickets'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('raffleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], RaffleController.prototype, "getMyTickets", null);
__decorate([
    (0, common_1.Get)('winners'),
    __param(0, (0, common_1.Query)('raffleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RaffleController.prototype, "getWinners", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], RaffleController.prototype, "getRaffleDetails", null);
__decorate([
    (0, common_1.Post)(':raffleId/tasks/:taskId/start'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('raffleId')),
    __param(2, (0, common_1.Param)('taskId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], RaffleController.prototype, "startTask", null);
__decorate([
    (0, common_1.Post)(':raffleId/tasks/:taskId/verify'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('raffleId')),
    __param(2, (0, common_1.Param)('taskId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], RaffleController.prototype, "verifyTask", null);
__decorate([
    (0, common_1.Post)(':raffleId/tasks/:taskId/claim'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('raffleId')),
    __param(2, (0, common_1.Param)('taskId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], RaffleController.prototype, "claimTickets", null);
exports.RaffleController = RaffleController = __decorate([
    (0, common_1.Controller)('raffles'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [raffle_service_1.RaffleService])
], RaffleController);
//# sourceMappingURL=raffle.controller.js.map