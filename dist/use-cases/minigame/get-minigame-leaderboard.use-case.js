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
exports.GetMinigameLeaderboardUseCase = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const minigame_score_entity_1 = require("../../domain/entities/minigame-score.entity");
const user_entity_1 = require("../../domain/entities/user.entity");
let GetMinigameLeaderboardUseCase = class GetMinigameLeaderboardUseCase {
    minigameScoreRepository;
    userRepository;
    constructor(minigameScoreRepository, userRepository) {
        this.minigameScoreRepository = minigameScoreRepository;
        this.userRepository = userRepository;
    }
    async execute(gameType, difficulty, limit = 100) {
        const queryBuilder = this.minigameScoreRepository
            .createQueryBuilder('score')
            .select('score.userId', 'userId')
            .addSelect('MAX(score.highScore)', 'highScore')
            .addSelect('COUNT(*)', 'gamesPlayed')
            .where('score.gameType = :gameType', { gameType })
            .groupBy('score.userId')
            .orderBy('"highScore"', 'DESC')
            .limit(limit);
        if (difficulty) {
            queryBuilder.andWhere('score.difficulty = :difficulty', { difficulty });
        }
        const results = await queryBuilder.getRawMany();
        const entries = [];
        let rank = 1;
        for (const result of results) {
            const user = await this.userRepository.findOne({
                where: { id: result.userId },
                select: ['id', 'username'],
            });
            entries.push({
                userId: result.userId,
                username: user?.username || 'Anonymous',
                highScore: parseInt(result.highScore, 10),
                rank: rank++,
                gamesPlayed: parseInt(result.gamesPlayed, 10),
            });
        }
        return entries;
    }
    async getUserRank(userId, gameType, difficulty) {
        const userScoreQuery = this.minigameScoreRepository
            .createQueryBuilder('score')
            .select('MAX(score.highScore)', 'highScore')
            .where('score.userId = :userId', { userId })
            .andWhere('score.gameType = :gameType', { gameType });
        if (difficulty) {
            userScoreQuery.andWhere('score.difficulty = :difficulty', { difficulty });
        }
        const userResult = await userScoreQuery.getRawOne();
        if (!userResult?.highScore)
            return null;
        const rankQuery = this.minigameScoreRepository
            .createQueryBuilder('score')
            .select('COUNT(DISTINCT score.userId)', 'count')
            .where('score.gameType = :gameType', { gameType });
        if (difficulty) {
            rankQuery.andWhere('score.difficulty = :difficulty', { difficulty });
        }
        const higherScoresQuery = this.minigameScoreRepository
            .createQueryBuilder('score')
            .select('score.userId')
            .where('score.gameType = :gameType', { gameType })
            .groupBy('score.userId')
            .having('MAX(score.highScore) > :userScore', {
            userScore: userResult.highScore,
        });
        if (difficulty) {
            higherScoresQuery.andWhere('score.difficulty = :difficulty', {
                difficulty,
            });
        }
        const higherScores = await higherScoresQuery.getRawMany();
        return higherScores.length + 1;
    }
    async getUserStats(userId) {
        const stats = [];
        for (const gameType of Object.values(minigame_score_entity_1.MinigameType)) {
            const scores = await this.minigameScoreRepository.find({
                where: { userId, gameType },
                order: { createdAt: 'DESC' },
            });
            if (scores.length === 0)
                continue;
            const highScore = Math.max(...scores.map((s) => s.highScore));
            const totalFollowers = scores.reduce((sum, s) => sum + s.followersEarned, BigInt(0));
            const totalGems = scores.reduce((sum, s) => sum + s.gemsEarned, 0);
            const avgScore = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
            stats.push({
                gameType,
                highScore,
                gamesPlayed: scores.length,
                totalFollowersEarned: totalFollowers,
                totalGemsEarned: totalGems,
                averageScore: Math.round(avgScore),
                lastPlayedAt: scores[0]?.createdAt || null,
            });
        }
        return stats;
    }
    async getRecentGames(userId, limit = 10) {
        return this.minigameScoreRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
    async getGlobalStats() {
        const totalGames = await this.minigameScoreRepository.count();
        const uniquePlayers = await this.minigameScoreRepository
            .createQueryBuilder('score')
            .select('COUNT(DISTINCT score.userId)', 'count')
            .getRawOne();
        const popularGame = await this.minigameScoreRepository
            .createQueryBuilder('score')
            .select('score.gameType', 'gameType')
            .addSelect('COUNT(*)', 'count')
            .groupBy('score.gameType')
            .orderBy('count', 'DESC')
            .limit(1)
            .getRawOne();
        const highestScore = await this.minigameScoreRepository
            .createQueryBuilder('score')
            .orderBy('score.highScore', 'DESC')
            .limit(1)
            .getOne();
        return {
            totalGamesPlayed: totalGames,
            totalPlayersParticipated: parseInt(uniquePlayers?.count || '0', 10),
            mostPopularGame: popularGame?.gameType || minigame_score_entity_1.MinigameType.QUIZ,
            highestScore: highestScore
                ? {
                    gameType: highestScore.gameType,
                    score: highestScore.highScore,
                    userId: highestScore.userId,
                }
                : { gameType: minigame_score_entity_1.MinigameType.QUIZ, score: 0, userId: '' },
        };
    }
};
exports.GetMinigameLeaderboardUseCase = GetMinigameLeaderboardUseCase;
exports.GetMinigameLeaderboardUseCase = GetMinigameLeaderboardUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(minigame_score_entity_1.MinigameScore)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], GetMinigameLeaderboardUseCase);
//# sourceMappingURL=get-minigame-leaderboard.use-case.js.map