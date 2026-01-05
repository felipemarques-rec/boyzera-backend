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
exports.MinigameController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const submit_minigame_score_use_case_1 = require("../../use-cases/minigame/submit-minigame-score.use-case");
const get_minigame_leaderboard_use_case_1 = require("../../use-cases/minigame/get-minigame-leaderboard.use-case");
const minigame_score_entity_1 = require("../../domain/entities/minigame-score.entity");
class SubmitScoreDto {
    gameType;
    difficulty;
    score;
    durationSeconds;
    metadata;
}
let MinigameController = class MinigameController {
    submitMinigameScoreUseCase;
    getMinigameLeaderboardUseCase;
    constructor(submitMinigameScoreUseCase, getMinigameLeaderboardUseCase) {
        this.submitMinigameScoreUseCase = submitMinigameScoreUseCase;
        this.getMinigameLeaderboardUseCase = getMinigameLeaderboardUseCase;
    }
    async submitScore(req, dto) {
        const result = await this.submitMinigameScoreUseCase.execute({
            userId: req.user.id,
            gameType: dto.gameType,
            difficulty: dto.difficulty,
            score: dto.score,
            durationSeconds: dto.durationSeconds,
            metadata: dto.metadata,
        });
        return {
            success: true,
            data: {
                scoreId: result.score.id,
                score: result.score.score,
                highScore: result.score.highScore,
                isHighScore: result.reward.isHighScore,
                reward: {
                    followers: result.reward.followers.toString(),
                    gems: result.reward.gems,
                },
            },
        };
    }
    async getLeaderboard(gameType, difficulty, limit) {
        const leaderboard = await this.getMinigameLeaderboardUseCase.execute(gameType, difficulty, Math.min(limit || 100, 100));
        return {
            success: true,
            data: leaderboard,
        };
    }
    async getUserRank(req, gameType, difficulty) {
        const rank = await this.getMinigameLeaderboardUseCase.getUserRank(req.user.id, gameType, difficulty);
        return {
            success: true,
            data: { rank },
        };
    }
    async getUserStats(req) {
        const stats = await this.getMinigameLeaderboardUseCase.getUserStats(req.user.id);
        return {
            success: true,
            data: stats.map((s) => ({
                gameType: s.gameType,
                highScore: s.highScore,
                gamesPlayed: s.gamesPlayed,
                totalFollowersEarned: s.totalFollowersEarned.toString(),
                totalGemsEarned: s.totalGemsEarned,
                averageScore: s.averageScore,
                lastPlayedAt: s.lastPlayedAt,
            })),
        };
    }
    async getRecentGames(req, limit) {
        const games = await this.getMinigameLeaderboardUseCase.getRecentGames(req.user.id, Math.min(limit, 50));
        return {
            success: true,
            data: games.map((g) => ({
                id: g.id,
                gameType: g.gameType,
                difficulty: g.difficulty,
                score: g.score,
                highScore: g.highScore,
                followersEarned: g.followersEarned.toString(),
                gemsEarned: g.gemsEarned,
                durationSeconds: g.durationSeconds,
                createdAt: g.createdAt,
            })),
        };
    }
    async getGlobalStats() {
        const stats = await this.getMinigameLeaderboardUseCase.getGlobalStats();
        return {
            success: true,
            data: {
                totalGamesPlayed: stats.totalGamesPlayed,
                totalPlayersParticipated: stats.totalPlayersParticipated,
                mostPopularGame: stats.mostPopularGame,
                highestScore: stats.highestScore,
            },
        };
    }
    async getMinigameTypes() {
        return {
            success: true,
            data: {
                types: Object.values(minigame_score_entity_1.MinigameType).map((type) => ({
                    id: type,
                    name: this.getMinigameDisplayName(type),
                    description: this.getMinigameDescription(type),
                })),
                difficulties: Object.values(minigame_score_entity_1.MinigameDifficulty),
            },
        };
    }
    getMinigameDisplayName(type) {
        const names = {
            [minigame_score_entity_1.MinigameType.QUIZ]: 'Quiz Brasileiro',
            [minigame_score_entity_1.MinigameType.MEMORY]: 'Jogo da Memoria',
            [minigame_score_entity_1.MinigameType.SPEED_TAP]: 'Tap Rapido',
            [minigame_score_entity_1.MinigameType.WORD_SCRAMBLE]: 'Palavras Embaralhadas',
            [minigame_score_entity_1.MinigameType.PATTERN_MATCH]: 'Encontre o Padrao',
        };
        return names[type];
    }
    getMinigameDescription(type) {
        const descriptions = {
            [minigame_score_entity_1.MinigameType.QUIZ]: 'Responda perguntas sobre cultura brasileira',
            [minigame_score_entity_1.MinigameType.MEMORY]: 'Encontre os pares de cartas',
            [minigame_score_entity_1.MinigameType.SPEED_TAP]: 'Toque o mais rapido possivel',
            [minigame_score_entity_1.MinigameType.WORD_SCRAMBLE]: 'Descubra as palavras embaralhadas',
            [minigame_score_entity_1.MinigameType.PATTERN_MATCH]: 'Encontre o padrao correto',
        };
        return descriptions[type];
    }
};
exports.MinigameController = MinigameController;
__decorate([
    (0, common_1.Post)('score'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, SubmitScoreDto]),
    __metadata("design:returntype", Promise)
], MinigameController.prototype, "submitScore", null);
__decorate([
    (0, common_1.Get)('leaderboard'),
    __param(0, (0, common_1.Query)('gameType')),
    __param(1, (0, common_1.Query)('difficulty')),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(100), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", Promise)
], MinigameController.prototype, "getLeaderboard", null);
__decorate([
    (0, common_1.Get)('rank'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('gameType')),
    __param(2, (0, common_1.Query)('difficulty')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], MinigameController.prototype, "getUserRank", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MinigameController.prototype, "getUserStats", null);
__decorate([
    (0, common_1.Get)('recent'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(10), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], MinigameController.prototype, "getRecentGames", null);
__decorate([
    (0, common_1.Get)('global-stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MinigameController.prototype, "getGlobalStats", null);
__decorate([
    (0, common_1.Get)('types'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MinigameController.prototype, "getMinigameTypes", null);
exports.MinigameController = MinigameController = __decorate([
    (0, common_1.Controller)('minigames'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [submit_minigame_score_use_case_1.SubmitMinigameScoreUseCase,
        get_minigame_leaderboard_use_case_1.GetMinigameLeaderboardUseCase])
], MinigameController);
//# sourceMappingURL=minigame.controller.js.map