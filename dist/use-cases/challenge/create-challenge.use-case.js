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
exports.CreateChallengeUseCase = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const challenge_entity_1 = require("../../domain/entities/challenge.entity");
const user_entity_1 = require("../../domain/entities/user.entity");
let CreateChallengeUseCase = class CreateChallengeUseCase {
    challengeRepository;
    userRepository;
    eventEmitter;
    DEFAULT_EXPIRATION_MINUTES = 15;
    DEFAULT_CONFIGS = {
        [challenge_entity_1.ChallengeType.X1_TAP]: { duration: 30, maxTaps: 1000 },
        [challenge_entity_1.ChallengeType.TRUCO]: { rounds: 3 },
        [challenge_entity_1.ChallengeType.SPEED_TAP]: { duration: 10 },
        [challenge_entity_1.ChallengeType.MEMORY]: { difficulty: 'medium' },
        [challenge_entity_1.ChallengeType.QUIZ]: { rounds: 5, difficulty: 'medium' },
    };
    constructor(challengeRepository, userRepository, eventEmitter) {
        this.challengeRepository = challengeRepository;
        this.userRepository = userRepository;
        this.eventEmitter = eventEmitter;
    }
    async execute(params) {
        const { challengerId, opponentId, type, betAmount, config, expiresInMinutes = this.DEFAULT_EXPIRATION_MINUTES, } = params;
        const challenger = await this.userRepository.findOne({
            where: { id: challengerId },
        });
        if (!challenger) {
            throw new common_1.NotFoundException('Challenger not found');
        }
        if (challenger.isBanned) {
            throw new common_1.BadRequestException('Challenger is banned');
        }
        const opponent = await this.userRepository.findOne({
            where: { id: opponentId },
        });
        if (!opponent) {
            throw new common_1.NotFoundException('Opponent not found');
        }
        if (opponent.isBanned) {
            throw new common_1.BadRequestException('Opponent is banned');
        }
        if (challengerId === opponentId) {
            throw new common_1.BadRequestException('Cannot challenge yourself');
        }
        if (betAmount < BigInt(0)) {
            throw new common_1.BadRequestException('Bet amount cannot be negative');
        }
        if (challenger.followers < betAmount) {
            throw new common_1.BadRequestException('Insufficient followers for bet');
        }
        const existingChallenge = await this.challengeRepository.findOne({
            where: [
                {
                    challengerId,
                    opponentId,
                    status: challenge_entity_1.ChallengeStatus.PENDING,
                },
                {
                    challengerId: opponentId,
                    opponentId: challengerId,
                    status: challenge_entity_1.ChallengeStatus.PENDING,
                },
            ],
        });
        if (existingChallenge) {
            throw new common_1.BadRequestException('A pending challenge already exists between these users');
        }
        challenger.followers = challenger.followers - betAmount;
        await this.userRepository.save(challenger);
        const prizePool = betAmount * BigInt(2);
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes);
        const finalConfig = {
            ...this.DEFAULT_CONFIGS[type],
            ...config,
        };
        const challenge = this.challengeRepository.create({
            type,
            status: challenge_entity_1.ChallengeStatus.PENDING,
            challengerId,
            opponentId,
            betAmount,
            prizePool,
            config: finalConfig,
            expiresAt,
        });
        await this.challengeRepository.save(challenge);
        this.eventEmitter.emit('challenge.created', {
            challengeId: challenge.id,
            challengerId,
            opponentId,
            type,
            betAmount: betAmount.toString(),
        });
        return challenge;
    }
    async getPendingChallenges(userId) {
        const now = new Date();
        return this.challengeRepository.find({
            where: [
                { challengerId: userId, status: challenge_entity_1.ChallengeStatus.PENDING },
                { opponentId: userId, status: challenge_entity_1.ChallengeStatus.PENDING },
            ],
            relations: ['challenger', 'opponent'],
            order: { createdAt: 'DESC' },
        });
    }
    async getActiveChallenges(userId) {
        return this.challengeRepository.find({
            where: [
                { challengerId: userId, status: challenge_entity_1.ChallengeStatus.ONGOING },
                { opponentId: userId, status: challenge_entity_1.ChallengeStatus.ONGOING },
            ],
            relations: ['challenger', 'opponent'],
            order: { startedAt: 'DESC' },
        });
    }
};
exports.CreateChallengeUseCase = CreateChallengeUseCase;
exports.CreateChallengeUseCase = CreateChallengeUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(challenge_entity_1.Challenge)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        event_emitter_1.EventEmitter2])
], CreateChallengeUseCase);
//# sourceMappingURL=create-challenge.use-case.js.map