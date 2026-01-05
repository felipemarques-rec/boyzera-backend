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
exports.SubmitMinigameScoreUseCase = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const minigame_score_entity_1 = require("../../domain/entities/minigame-score.entity");
const user_entity_1 = require("../../domain/entities/user.entity");
let SubmitMinigameScoreUseCase = class SubmitMinigameScoreUseCase {
    minigameScoreRepository;
    userRepository;
    eventEmitter;
    DIFFICULTY_MULTIPLIERS = {
        [minigame_score_entity_1.MinigameDifficulty.EASY]: 1,
        [minigame_score_entity_1.MinigameDifficulty.MEDIUM]: 1.5,
        [minigame_score_entity_1.MinigameDifficulty.HARD]: 2,
    };
    BASE_REWARDS = {
        [minigame_score_entity_1.MinigameType.QUIZ]: { followers: 50, gems: 1 },
        [minigame_score_entity_1.MinigameType.MEMORY]: { followers: 30, gems: 1 },
        [minigame_score_entity_1.MinigameType.SPEED_TAP]: { followers: 20, gems: 0 },
        [minigame_score_entity_1.MinigameType.WORD_SCRAMBLE]: { followers: 40, gems: 1 },
        [minigame_score_entity_1.MinigameType.PATTERN_MATCH]: { followers: 35, gems: 1 },
    };
    constructor(minigameScoreRepository, userRepository, eventEmitter) {
        this.minigameScoreRepository = minigameScoreRepository;
        this.userRepository = userRepository;
        this.eventEmitter = eventEmitter;
    }
    async execute(params) {
        const { userId, gameType, difficulty, score, durationSeconds, metadata } = params;
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.isBanned) {
            throw new common_1.BadRequestException('User is banned');
        }
        if (score < 0) {
            throw new common_1.BadRequestException('Score cannot be negative');
        }
        const existingHighScore = await this.getHighScore(userId, gameType);
        const isHighScore = score > existingHighScore;
        const reward = this.calculateReward(gameType, difficulty, score, isHighScore);
        const minigameScore = this.minigameScoreRepository.create({
            userId,
            gameType,
            difficulty,
            score,
            highScore: isHighScore ? score : existingHighScore,
            followersEarned: reward.followers,
            gemsEarned: reward.gems,
            durationSeconds,
            metadata,
        });
        await this.minigameScoreRepository.save(minigameScore);
        user.followers = user.followers + reward.followers;
        user.gems += reward.gems;
        await this.userRepository.save(user);
        this.eventEmitter.emit('minigame.completed', {
            userId,
            gameType,
            score,
            isHighScore,
            followersEarned: reward.followers.toString(),
            gemsEarned: reward.gems,
        });
        if (isHighScore) {
            this.eventEmitter.emit('minigame.highscore', {
                userId,
                gameType,
                score,
                previousHighScore: existingHighScore,
            });
        }
        return { score: minigameScore, reward };
    }
    async getHighScore(userId, gameType) {
        const result = await this.minigameScoreRepository
            .createQueryBuilder('score')
            .select('MAX(score.highScore)', 'maxScore')
            .where('score.userId = :userId', { userId })
            .andWhere('score.gameType = :gameType', { gameType })
            .getRawOne();
        return result?.maxScore ?? 0;
    }
    calculateReward(gameType, difficulty, score, isHighScore) {
        const baseReward = this.BASE_REWARDS[gameType];
        const difficultyMultiplier = this.DIFFICULTY_MULTIPLIERS[difficulty];
        const scoreMultiplier = Math.min(score / 100, 5);
        const highScoreBonus = isHighScore ? 1.5 : 1;
        const followers = BigInt(Math.floor(baseReward.followers *
            difficultyMultiplier *
            scoreMultiplier *
            highScoreBonus));
        const gems = isHighScore
            ? baseReward.gems * Math.floor(difficultyMultiplier)
            : 0;
        return { followers, gems, isHighScore };
    }
};
exports.SubmitMinigameScoreUseCase = SubmitMinigameScoreUseCase;
exports.SubmitMinigameScoreUseCase = SubmitMinigameScoreUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(minigame_score_entity_1.MinigameScore)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        event_emitter_1.EventEmitter2])
], SubmitMinigameScoreUseCase);
//# sourceMappingURL=submit-minigame-score.use-case.js.map