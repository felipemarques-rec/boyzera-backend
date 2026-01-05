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
exports.AcceptChallengeUseCase = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const challenge_entity_1 = require("../../domain/entities/challenge.entity");
const user_entity_1 = require("../../domain/entities/user.entity");
let AcceptChallengeUseCase = class AcceptChallengeUseCase {
    challengeRepository;
    userRepository;
    eventEmitter;
    constructor(challengeRepository, userRepository, eventEmitter) {
        this.challengeRepository = challengeRepository;
        this.userRepository = userRepository;
        this.eventEmitter = eventEmitter;
    }
    async execute(challengeId, userId) {
        const challenge = await this.challengeRepository.findOne({
            where: { id: challengeId },
            relations: ['challenger', 'opponent'],
        });
        if (!challenge) {
            throw new common_1.NotFoundException('Challenge not found');
        }
        if (challenge.opponentId !== userId) {
            throw new common_1.ForbiddenException('Only the challenged player can accept');
        }
        if (!challenge.canAccept()) {
            if (challenge.expiresAt && new Date() > challenge.expiresAt) {
                challenge.status = challenge_entity_1.ChallengeStatus.EXPIRED;
                await this.challengeRepository.save(challenge);
                await this.refundChallenger(challenge);
                throw new common_1.BadRequestException('Challenge has expired');
            }
            throw new common_1.BadRequestException('Challenge cannot be accepted');
        }
        const opponent = await this.userRepository.findOne({
            where: { id: userId },
        });
        if (!opponent) {
            throw new common_1.NotFoundException('User not found');
        }
        if (opponent.isBanned) {
            throw new common_1.BadRequestException('You are banned from challenges');
        }
        if (opponent.followers < challenge.betAmount) {
            throw new common_1.BadRequestException('Insufficient followers to accept this challenge');
        }
        opponent.followers = opponent.followers - challenge.betAmount;
        await this.userRepository.save(opponent);
        challenge.status = challenge_entity_1.ChallengeStatus.ACCEPTED;
        await this.challengeRepository.save(challenge);
        this.eventEmitter.emit('challenge.accepted', {
            challengeId: challenge.id,
            challengerId: challenge.challengerId,
            opponentId: challenge.opponentId,
            type: challenge.type,
        });
        return challenge;
    }
    async startChallenge(challengeId) {
        const challenge = await this.challengeRepository.findOne({
            where: { id: challengeId },
        });
        if (!challenge) {
            throw new common_1.NotFoundException('Challenge not found');
        }
        if (challenge.status !== challenge_entity_1.ChallengeStatus.ACCEPTED) {
            throw new common_1.BadRequestException('Challenge must be accepted before starting');
        }
        challenge.status = challenge_entity_1.ChallengeStatus.ONGOING;
        challenge.startedAt = new Date();
        await this.challengeRepository.save(challenge);
        this.eventEmitter.emit('challenge.started', {
            challengeId: challenge.id,
            challengerId: challenge.challengerId,
            opponentId: challenge.opponentId,
            type: challenge.type,
            config: challenge.config,
        });
        return challenge;
    }
    async declineChallenge(challengeId, userId) {
        const challenge = await this.challengeRepository.findOne({
            where: { id: challengeId },
        });
        if (!challenge) {
            throw new common_1.NotFoundException('Challenge not found');
        }
        if (challenge.opponentId !== userId) {
            throw new common_1.ForbiddenException('Only the challenged player can decline');
        }
        if (challenge.status !== challenge_entity_1.ChallengeStatus.PENDING) {
            throw new common_1.BadRequestException('Challenge is not pending');
        }
        challenge.status = challenge_entity_1.ChallengeStatus.CANCELLED;
        await this.challengeRepository.save(challenge);
        await this.refundChallenger(challenge);
        this.eventEmitter.emit('challenge.declined', {
            challengeId: challenge.id,
            challengerId: challenge.challengerId,
            opponentId: challenge.opponentId,
        });
        return challenge;
    }
    async cancelChallenge(challengeId, userId) {
        const challenge = await this.challengeRepository.findOne({
            where: { id: challengeId },
        });
        if (!challenge) {
            throw new common_1.NotFoundException('Challenge not found');
        }
        if (challenge.challengerId !== userId) {
            throw new common_1.ForbiddenException('Only the challenger can cancel');
        }
        if (challenge.status !== challenge_entity_1.ChallengeStatus.PENDING) {
            throw new common_1.BadRequestException('Can only cancel pending challenges');
        }
        challenge.status = challenge_entity_1.ChallengeStatus.CANCELLED;
        await this.challengeRepository.save(challenge);
        await this.refundChallenger(challenge);
        this.eventEmitter.emit('challenge.cancelled', {
            challengeId: challenge.id,
            challengerId: challenge.challengerId,
            opponentId: challenge.opponentId,
        });
        return challenge;
    }
    async refundChallenger(challenge) {
        const challenger = await this.userRepository.findOne({
            where: { id: challenge.challengerId },
        });
        if (challenger) {
            challenger.followers = challenger.followers + challenge.betAmount;
            await this.userRepository.save(challenger);
        }
    }
};
exports.AcceptChallengeUseCase = AcceptChallengeUseCase;
exports.AcceptChallengeUseCase = AcceptChallengeUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(challenge_entity_1.Challenge)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        event_emitter_1.EventEmitter2])
], AcceptChallengeUseCase);
//# sourceMappingURL=accept-challenge.use-case.js.map