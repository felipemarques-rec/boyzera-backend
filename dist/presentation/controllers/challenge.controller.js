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
exports.ChallengeController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const create_challenge_use_case_1 = require("../../use-cases/challenge/create-challenge.use-case");
const accept_challenge_use_case_1 = require("../../use-cases/challenge/accept-challenge.use-case");
const complete_challenge_use_case_1 = require("../../use-cases/challenge/complete-challenge.use-case");
class CreateChallengeDto {
    opponentId;
    type;
    betAmount;
    config;
}
class SubmitScoreDto {
    score;
}
let ChallengeController = class ChallengeController {
    createChallengeUseCase;
    acceptChallengeUseCase;
    completeChallengeUseCase;
    constructor(createChallengeUseCase, acceptChallengeUseCase, completeChallengeUseCase) {
        this.createChallengeUseCase = createChallengeUseCase;
        this.acceptChallengeUseCase = acceptChallengeUseCase;
        this.completeChallengeUseCase = completeChallengeUseCase;
    }
    async createChallenge(req, dto) {
        const challenge = await this.createChallengeUseCase.execute({
            challengerId: req.user.id,
            opponentId: dto.opponentId,
            type: dto.type,
            betAmount: BigInt(dto.betAmount),
            config: dto.config,
        });
        return {
            success: true,
            data: this.formatChallenge(challenge),
        };
    }
    async getPendingChallenges(req) {
        const challenges = await this.createChallengeUseCase.getPendingChallenges(req.user.id);
        return {
            success: true,
            data: challenges.map((c) => this.formatChallenge(c)),
        };
    }
    async getActiveChallenges(req) {
        const challenges = await this.createChallengeUseCase.getActiveChallenges(req.user.id);
        return {
            success: true,
            data: challenges.map((c) => this.formatChallenge(c)),
        };
    }
    async acceptChallenge(id, req) {
        const challenge = await this.acceptChallengeUseCase.execute(id, req.user.id);
        return {
            success: true,
            data: this.formatChallenge(challenge),
        };
    }
    async startChallenge(id) {
        const challenge = await this.acceptChallengeUseCase.startChallenge(id);
        return {
            success: true,
            data: this.formatChallenge(challenge),
        };
    }
    async declineChallenge(id, req) {
        const challenge = await this.acceptChallengeUseCase.declineChallenge(id, req.user.id);
        return {
            success: true,
            data: this.formatChallenge(challenge),
            message: 'Challenge declined',
        };
    }
    async cancelChallenge(id, req) {
        const challenge = await this.acceptChallengeUseCase.cancelChallenge(id, req.user.id);
        return {
            success: true,
            data: this.formatChallenge(challenge),
            message: 'Challenge cancelled',
        };
    }
    async submitScore(id, req, dto) {
        const result = await this.completeChallengeUseCase.submitScore({
            challengeId: id,
            userId: req.user.id,
            score: dto.score,
        });
        return {
            success: true,
            data: {
                challenge: this.formatChallenge(result.challenge),
                isComplete: result.isComplete,
            },
        };
    }
    async getChallengeHistory(req, limit) {
        const challenges = await this.completeChallengeUseCase.getChallengeHistory(req.user.id, Math.min(limit, 50));
        return {
            success: true,
            data: challenges.map((c) => this.formatChallenge(c)),
        };
    }
    async getChallengeStats(req) {
        const stats = await this.completeChallengeUseCase.getChallengeStats(req.user.id);
        return {
            success: true,
            data: {
                totalChallenges: stats.totalChallenges,
                wins: stats.wins,
                losses: stats.losses,
                ties: stats.ties,
                winRate: stats.winRate.toFixed(1),
                totalEarned: stats.totalEarned.toString(),
                totalLost: stats.totalLost.toString(),
            },
        };
    }
    formatChallenge(challenge) {
        return {
            id: challenge.id,
            type: challenge.type,
            status: challenge.status,
            challengerId: challenge.challengerId,
            challengerUsername: challenge.challenger?.username,
            opponentId: challenge.opponentId,
            opponentUsername: challenge.opponent?.username,
            betAmount: challenge.betAmount.toString(),
            prizePool: challenge.prizePool.toString(),
            config: challenge.config,
            result: challenge.result
                ? {
                    challengerScore: challenge.result.challengerScore,
                    opponentScore: challenge.result.opponentScore,
                    winnerId: challenge.result.winnerId,
                }
                : null,
            expiresAt: challenge.expiresAt,
            startedAt: challenge.startedAt,
            endedAt: challenge.endedAt,
            createdAt: challenge.createdAt,
        };
    }
};
exports.ChallengeController = ChallengeController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CreateChallengeDto]),
    __metadata("design:returntype", Promise)
], ChallengeController.prototype, "createChallenge", null);
__decorate([
    (0, common_1.Get)('pending'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChallengeController.prototype, "getPendingChallenges", null);
__decorate([
    (0, common_1.Get)('active'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChallengeController.prototype, "getActiveChallenges", null);
__decorate([
    (0, common_1.Post)(':id/accept'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ChallengeController.prototype, "acceptChallenge", null);
__decorate([
    (0, common_1.Post)(':id/start'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChallengeController.prototype, "startChallenge", null);
__decorate([
    (0, common_1.Post)(':id/decline'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ChallengeController.prototype, "declineChallenge", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ChallengeController.prototype, "cancelChallenge", null);
__decorate([
    (0, common_1.Post)(':id/score'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, SubmitScoreDto]),
    __metadata("design:returntype", Promise)
], ChallengeController.prototype, "submitScore", null);
__decorate([
    (0, common_1.Get)('history'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], ChallengeController.prototype, "getChallengeHistory", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChallengeController.prototype, "getChallengeStats", null);
exports.ChallengeController = ChallengeController = __decorate([
    (0, common_1.Controller)('challenges'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [create_challenge_use_case_1.CreateChallengeUseCase,
        accept_challenge_use_case_1.AcceptChallengeUseCase,
        complete_challenge_use_case_1.CompleteChallengeUseCase])
], ChallengeController);
//# sourceMappingURL=challenge.controller.js.map