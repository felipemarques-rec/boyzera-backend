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
exports.CompleteChallengeUseCase = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const challenge_entity_1 = require("../../domain/entities/challenge.entity");
const user_entity_1 = require("../../domain/entities/user.entity");
let CompleteChallengeUseCase = class CompleteChallengeUseCase {
    challengeRepository;
    userRepository;
    eventEmitter;
    challengeScores = new Map();
    constructor(challengeRepository, userRepository, eventEmitter) {
        this.challengeRepository = challengeRepository;
        this.userRepository = userRepository;
        this.eventEmitter = eventEmitter;
    }
    async submitScore(params) {
        const { challengeId, userId, score } = params;
        const challenge = await this.challengeRepository.findOne({
            where: { id: challengeId },
        });
        if (!challenge) {
            throw new common_1.NotFoundException('Challenge not found');
        }
        if (challenge.status !== challenge_entity_1.ChallengeStatus.ONGOING) {
            throw new common_1.BadRequestException('Challenge is not ongoing');
        }
        if (!challenge.isParticipant(userId)) {
            throw new common_1.BadRequestException('User is not a participant in this challenge');
        }
        let scores = this.challengeScores.get(challengeId);
        if (!scores) {
            scores = { challengerScore: null, opponentScore: null };
            this.challengeScores.set(challengeId, scores);
        }
        if (userId === challenge.challengerId) {
            scores.challengerScore = score;
        }
        else {
            scores.opponentScore = score;
        }
        if (scores.challengerScore !== null && scores.opponentScore !== null) {
            const completedChallenge = await this.completeChallenge(challenge, scores.challengerScore, scores.opponentScore);
            this.challengeScores.delete(challengeId);
            return { challenge: completedChallenge, isComplete: true };
        }
        return { challenge, isComplete: false };
    }
    async completeChallenge(challenge, challengerScore, opponentScore) {
        let winnerId = null;
        if (challengerScore > opponentScore) {
            winnerId = challenge.challengerId;
        }
        else if (opponentScore > challengerScore) {
            winnerId = challenge.opponentId;
        }
        const result = {
            challengerId: challenge.challengerId,
            challengerScore,
            opponentId: challenge.opponentId,
            opponentScore,
            winnerId,
            completedAt: new Date(),
        };
        challenge.status = challenge_entity_1.ChallengeStatus.COMPLETED;
        challenge.result = result;
        challenge.endedAt = new Date();
        await this.challengeRepository.save(challenge);
        await this.distributeRewards(challenge, winnerId);
        this.eventEmitter.emit('challenge.completed', {
            challengeId: challenge.id,
            challengerId: challenge.challengerId,
            challengerScore,
            opponentId: challenge.opponentId,
            opponentScore,
            winnerId,
            prizePool: challenge.prizePool.toString(),
        });
        return challenge;
    }
    async distributeRewards(challenge, winnerId) {
        if (winnerId) {
            const winner = await this.userRepository.findOne({
                where: { id: winnerId },
            });
            if (winner) {
                winner.followers = winner.followers + challenge.prizePool;
                await this.userRepository.save(winner);
                this.eventEmitter.emit('challenge.reward.distributed', {
                    challengeId: challenge.id,
                    userId: winnerId,
                    amount: challenge.prizePool.toString(),
                    isWinner: true,
                });
            }
        }
        else {
            const challenger = await this.userRepository.findOne({
                where: { id: challenge.challengerId },
            });
            const opponent = await this.userRepository.findOne({
                where: { id: challenge.opponentId },
            });
            if (challenger) {
                challenger.followers = challenger.followers + challenge.betAmount;
                await this.userRepository.save(challenger);
            }
            if (opponent) {
                opponent.followers = opponent.followers + challenge.betAmount;
                await this.userRepository.save(opponent);
            }
            this.eventEmitter.emit('challenge.tie', {
                challengeId: challenge.id,
                challengerId: challenge.challengerId,
                opponentId: challenge.opponentId,
                betReturned: challenge.betAmount.toString(),
            });
        }
    }
    async getChallengeHistory(userId, limit = 20) {
        return this.challengeRepository.find({
            where: [
                { challengerId: userId, status: challenge_entity_1.ChallengeStatus.COMPLETED },
                { opponentId: userId, status: challenge_entity_1.ChallengeStatus.COMPLETED },
            ],
            relations: ['challenger', 'opponent'],
            order: { endedAt: 'DESC' },
            take: limit,
        });
    }
    async getChallengeStats(userId) {
        const challenges = await this.challengeRepository.find({
            where: [
                { challengerId: userId, status: challenge_entity_1.ChallengeStatus.COMPLETED },
                { opponentId: userId, status: challenge_entity_1.ChallengeStatus.COMPLETED },
            ],
        });
        let wins = 0;
        let losses = 0;
        let ties = 0;
        let totalEarned = BigInt(0);
        let totalLost = BigInt(0);
        for (const challenge of challenges) {
            if (!challenge.result)
                continue;
            if (challenge.result.winnerId === userId) {
                wins++;
                totalEarned += challenge.prizePool - challenge.betAmount;
            }
            else if (challenge.result.winnerId === null) {
                ties++;
            }
            else {
                losses++;
                totalLost += challenge.betAmount;
            }
        }
        const totalChallenges = challenges.length;
        const winRate = totalChallenges > 0 ? (wins / totalChallenges) * 100 : 0;
        return {
            totalChallenges,
            wins,
            losses,
            ties,
            winRate,
            totalEarned,
            totalLost,
        };
    }
};
exports.CompleteChallengeUseCase = CompleteChallengeUseCase;
exports.CompleteChallengeUseCase = CompleteChallengeUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(challenge_entity_1.Challenge)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        event_emitter_1.EventEmitter2])
], CompleteChallengeUseCase);
//# sourceMappingURL=complete-challenge.use-case.js.map