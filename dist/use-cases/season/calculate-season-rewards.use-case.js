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
exports.CalculateSeasonRewardsUseCase = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const season_entity_1 = require("../../domain/entities/season.entity");
const user_entity_1 = require("../../domain/entities/user.entity");
const redis_service_1 = require("../../infrastructure/redis/redis.service");
let CalculateSeasonRewardsUseCase = class CalculateSeasonRewardsUseCase {
    seasonRepository;
    userRepository;
    redisService;
    eventEmitter;
    constructor(seasonRepository, userRepository, redisService, eventEmitter) {
        this.seasonRepository = seasonRepository;
        this.userRepository = userRepository;
        this.redisService = redisService;
        this.eventEmitter = eventEmitter;
    }
    async execute(seasonId) {
        const season = await this.seasonRepository.findOne({
            where: { id: seasonId },
        });
        if (!season) {
            throw new common_1.NotFoundException('Season not found');
        }
        if (season.status !== season_entity_1.SeasonStatus.ENDED) {
            throw new common_1.BadRequestException('Season has not ended yet');
        }
        if (season.rewardsDistributed) {
            throw new common_1.BadRequestException('Rewards already distributed for this season');
        }
        const leaderboard = await this.getSeasonLeaderboard(seasonId);
        if (leaderboard.length === 0) {
            return {
                seasonId: season.id,
                seasonName: season.name,
                totalParticipants: 0,
                rewards: [],
                distributed: false,
            };
        }
        const rewards = this.calculateRewardsForLeaderboard(leaderboard, season.prizePool.tiers);
        return {
            seasonId: season.id,
            seasonName: season.name,
            totalParticipants: leaderboard.length,
            rewards,
            distributed: false,
        };
    }
    async distributeRewards(seasonId) {
        const result = await this.execute(seasonId);
        if (result.rewards.length === 0) {
            return { ...result, distributed: true };
        }
        for (const reward of result.rewards) {
            await this.applyRewardToUser(reward);
            this.eventEmitter.emit('season.reward.distributed', {
                userId: reward.userId,
                seasonId: result.seasonId,
                seasonName: result.seasonName,
                rank: reward.rank,
                gems: reward.gems,
                followers: reward.followers,
                tokensBz: reward.tokensBz,
                title: reward.title,
            });
        }
        await this.seasonRepository.update(seasonId, {
            rewardsDistributed: true,
            rewardsDistributedAt: new Date(),
        });
        return { ...result, distributed: true };
    }
    async getSeasonLeaderboard(seasonId) {
        const redisKey = `season:${seasonId}:leaderboard`;
        const cachedLeaderboard = await this.redisService.getLeaderboard(redisKey, 0, 999);
        if (cachedLeaderboard.length > 0) {
            const entries = [];
            for (let i = 0; i < cachedLeaderboard.length; i++) {
                const userId = cachedLeaderboard[i].member;
                const user = await this.userRepository.findOne({
                    where: { id: userId },
                    select: ['id', 'username', 'followers'],
                });
                if (user) {
                    entries.push({
                        userId: user.id,
                        username: user.username || 'Anonymous',
                        followers: user.followers,
                        rank: i + 1,
                    });
                }
            }
            return entries;
        }
        const users = await this.userRepository.find({
            order: { followers: 'DESC' },
            take: 1000,
            select: ['id', 'username', 'followers'],
        });
        return users.map((user, index) => ({
            userId: user.id,
            username: user.username || 'Anonymous',
            followers: user.followers,
            rank: index + 1,
        }));
    }
    calculateRewardsForLeaderboard(leaderboard, tiers) {
        const rewards = [];
        for (const entry of leaderboard) {
            const tier = this.findTierForRank(entry.rank, tiers);
            if (tier) {
                rewards.push({
                    userId: entry.userId,
                    rank: entry.rank,
                    gems: tier.gems,
                    followers: BigInt(tier.followers),
                    tokensBz: tier.tokensBz,
                    title: tier.title,
                });
            }
        }
        return rewards;
    }
    findTierForRank(rank, tiers) {
        const exactMatch = tiers.find((tier) => tier.rank === rank);
        if (exactMatch) {
            return exactMatch;
        }
        const rangeMatch = tiers.find((tier) => tier.rank === 0 &&
            tier.minRank !== undefined &&
            tier.maxRank !== undefined &&
            rank >= tier.minRank &&
            rank <= tier.maxRank);
        return rangeMatch || null;
    }
    async applyRewardToUser(reward) {
        const user = await this.userRepository.findOne({
            where: { id: reward.userId },
        });
        if (!user) {
            return;
        }
        user.gems += reward.gems;
        user.followers = user.followers + reward.followers;
        user.tokensBz += reward.tokensBz;
        await this.userRepository.save(user);
    }
    async getUserSeasonRank(userId, seasonId) {
        const redisKey = seasonId
            ? `season:${seasonId}:leaderboard`
            : 'leaderboard:global';
        const rank = await this.redisService.getRank(redisKey, userId);
        return rank !== null ? rank + 1 : null;
    }
    async getSeasonStats(seasonId) {
        const leaderboard = await this.getSeasonLeaderboard(seasonId);
        if (leaderboard.length === 0) {
            return {
                totalParticipants: 0,
                topPlayer: null,
                averageFollowers: BigInt(0),
            };
        }
        const totalFollowers = leaderboard.reduce((sum, entry) => sum + entry.followers, BigInt(0));
        return {
            totalParticipants: leaderboard.length,
            topPlayer: leaderboard[0],
            averageFollowers: totalFollowers / BigInt(leaderboard.length),
        };
    }
};
exports.CalculateSeasonRewardsUseCase = CalculateSeasonRewardsUseCase;
exports.CalculateSeasonRewardsUseCase = CalculateSeasonRewardsUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(season_entity_1.Season)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        redis_service_1.RedisService,
        event_emitter_1.EventEmitter2])
], CalculateSeasonRewardsUseCase);
//# sourceMappingURL=calculate-season-rewards.use-case.js.map