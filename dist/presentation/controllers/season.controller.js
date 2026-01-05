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
exports.SeasonController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const get_current_season_use_case_1 = require("../../use-cases/season/get-current-season.use-case");
const calculate_season_rewards_use_case_1 = require("../../use-cases/season/calculate-season-rewards.use-case");
let SeasonController = class SeasonController {
    getCurrentSeasonUseCase;
    calculateSeasonRewardsUseCase;
    constructor(getCurrentSeasonUseCase, calculateSeasonRewardsUseCase) {
        this.getCurrentSeasonUseCase = getCurrentSeasonUseCase;
        this.calculateSeasonRewardsUseCase = calculateSeasonRewardsUseCase;
    }
    async getCurrentSeason() {
        const result = await this.getCurrentSeasonUseCase.execute();
        if (!result) {
            return {
                success: true,
                data: null,
                message: 'No active or upcoming season',
            };
        }
        return {
            success: true,
            data: {
                id: result.season.id,
                name: result.season.name,
                description: result.season.description,
                status: result.season.status,
                seasonNumber: result.season.seasonNumber,
                startDate: result.season.startDate,
                endDate: result.season.endDate,
                bannerUrl: result.season.bannerUrl,
                themeColor: result.season.themeColor,
                prizePool: result.season.prizePool,
                daysRemaining: result.daysRemaining,
                progressPercentage: result.progressPercentage,
                isActive: result.isActive,
            },
        };
    }
    async getAllSeasons() {
        const seasons = await this.getCurrentSeasonUseCase.getAllSeasons();
        return {
            success: true,
            data: seasons.map((season) => ({
                id: season.id,
                name: season.name,
                status: season.status,
                seasonNumber: season.seasonNumber,
                startDate: season.startDate,
                endDate: season.endDate,
                isActive: season.isActive(),
                rewardsDistributed: season.rewardsDistributed,
            })),
        };
    }
    async getSeasonHistory() {
        const seasons = await this.getCurrentSeasonUseCase.getSeasonHistory();
        return {
            success: true,
            data: seasons.map((season) => ({
                id: season.id,
                name: season.name,
                seasonNumber: season.seasonNumber,
                startDate: season.startDate,
                endDate: season.endDate,
                prizePool: season.prizePool,
                rewardsDistributed: season.rewardsDistributed,
                rewardsDistributedAt: season.rewardsDistributedAt,
            })),
        };
    }
    async getSeasonById(id) {
        const season = await this.getCurrentSeasonUseCase.getSeasonById(id);
        if (!season) {
            return {
                success: false,
                message: 'Season not found',
            };
        }
        return {
            success: true,
            data: {
                id: season.id,
                name: season.name,
                description: season.description,
                status: season.status,
                seasonNumber: season.seasonNumber,
                startDate: season.startDate,
                endDate: season.endDate,
                bannerUrl: season.bannerUrl,
                themeColor: season.themeColor,
                prizePool: season.prizePool,
                daysRemaining: season.getDaysRemaining(),
                progressPercentage: season.getProgressPercentage(),
                isActive: season.isActive(),
                rewardsDistributed: season.rewardsDistributed,
                rewardsDistributedAt: season.rewardsDistributedAt,
            },
        };
    }
    async getSeasonStats(id) {
        const stats = await this.calculateSeasonRewardsUseCase.getSeasonStats(id);
        return {
            success: true,
            data: {
                totalParticipants: stats.totalParticipants,
                topPlayer: stats.topPlayer
                    ? {
                        userId: stats.topPlayer.userId,
                        username: stats.topPlayer.username,
                        followers: stats.topPlayer.followers.toString(),
                        rank: stats.topPlayer.rank,
                    }
                    : null,
                averageFollowers: stats.averageFollowers.toString(),
            },
        };
    }
    async getMySeasonRank(id, req) {
        const userId = req.user.id;
        const rank = await this.calculateSeasonRewardsUseCase.getUserSeasonRank(userId, id);
        return {
            success: true,
            data: {
                seasonId: id,
                userId,
                rank,
            },
        };
    }
    async previewSeasonRewards(id) {
        try {
            const result = await this.calculateSeasonRewardsUseCase.execute(id);
            return {
                success: true,
                data: {
                    seasonId: result.seasonId,
                    seasonName: result.seasonName,
                    totalParticipants: result.totalParticipants,
                    rewards: result.rewards.slice(0, 100).map((reward) => ({
                        userId: reward.userId,
                        rank: reward.rank,
                        gems: reward.gems,
                        followers: reward.followers.toString(),
                        tokensBz: reward.tokensBz,
                        title: reward.title,
                    })),
                    previewOnly: true,
                },
            };
        }
        catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to preview rewards',
            };
        }
    }
    async distributeSeasonRewards(id) {
        try {
            const result = await this.calculateSeasonRewardsUseCase.distributeRewards(id);
            return {
                success: true,
                data: {
                    seasonId: result.seasonId,
                    seasonName: result.seasonName,
                    totalParticipants: result.totalParticipants,
                    rewardsDistributed: result.rewards.length,
                    distributed: result.distributed,
                },
            };
        }
        catch (error) {
            return {
                success: false,
                message: error instanceof Error
                    ? error.message
                    : 'Failed to distribute rewards',
            };
        }
    }
};
exports.SeasonController = SeasonController;
__decorate([
    (0, common_1.Get)('current'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SeasonController.prototype, "getCurrentSeason", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SeasonController.prototype, "getAllSeasons", null);
__decorate([
    (0, common_1.Get)('history'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SeasonController.prototype, "getSeasonHistory", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SeasonController.prototype, "getSeasonById", null);
__decorate([
    (0, common_1.Get)(':id/stats'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SeasonController.prototype, "getSeasonStats", null);
__decorate([
    (0, common_1.Get)(':id/my-rank'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SeasonController.prototype, "getMySeasonRank", null);
__decorate([
    (0, common_1.Get)(':id/rewards/preview'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SeasonController.prototype, "previewSeasonRewards", null);
__decorate([
    (0, common_1.Post)(':id/rewards/distribute'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SeasonController.prototype, "distributeSeasonRewards", null);
exports.SeasonController = SeasonController = __decorate([
    (0, common_1.Controller)('seasons'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [get_current_season_use_case_1.GetCurrentSeasonUseCase,
        calculate_season_rewards_use_case_1.CalculateSeasonRewardsUseCase])
], SeasonController);
//# sourceMappingURL=season.controller.js.map