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
exports.GetLeaderboardUseCase = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../../domain/entities/user.entity");
const redis_service_1 = require("../../infrastructure/redis/redis.service");
let GetLeaderboardUseCase = class GetLeaderboardUseCase {
    userRepository;
    redisService;
    constructor(userRepository, redisService) {
        this.userRepository = userRepository;
        this.redisService = redisService;
    }
    async execute(type = 'global', limit = 100) {
        const key = `leaderboard:${type}`;
        const redisEntries = await this.redisService.zrevrangeWithScores(key, 0, limit - 1);
        if (redisEntries.length > 0) {
            const userIds = redisEntries.map((e) => e.member);
            const users = await this.userRepository.find({
                where: { id: (0, typeorm_2.In)(userIds) },
                select: [
                    'id',
                    'username',
                    'firstName',
                    'lastName',
                    'nickname',
                    'avatarUrl',
                    'followers',
                    'level',
                ],
            });
            const userMap = new Map(users.map((u) => [u.id, u]));
            return redisEntries.map((entry, index) => {
                const user = userMap.get(entry.member);
                return {
                    rank: index + 1,
                    userId: entry.member,
                    username: user?.username || null,
                    firstName: user?.firstName || null,
                    lastName: user?.lastName || null,
                    nickname: user?.nickname || null,
                    avatarUrl: user?.avatarUrl || null,
                    followers: user?.followers.toString() || entry.score.toString(),
                    level: user?.level || 1,
                };
            });
        }
        return this.getFromDatabase(limit);
    }
    async getFromDatabase(limit = 100) {
        const users = await this.userRepository.find({
            where: { isBanned: false },
            order: { followers: 'DESC' },
            take: limit,
            select: [
                'id',
                'username',
                'firstName',
                'lastName',
                'nickname',
                'avatarUrl',
                'followers',
                'level',
            ],
        });
        for (const user of users) {
            await this.redisService.zadd('leaderboard:global', Number(user.followers), user.id);
        }
        return users.map((user, index) => ({
            rank: index + 1,
            userId: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            nickname: user.nickname,
            avatarUrl: user.avatarUrl,
            followers: user.followers.toString(),
            level: user.level,
        }));
    }
    async getUserRank(userId) {
        const rank = await this.redisService.zrevrank('leaderboard:global', userId);
        return rank !== null ? rank + 1 : null;
    }
    async updateUserScore(userId, followers) {
        await this.redisService.zadd('leaderboard:global', Number(followers), userId);
    }
    async rebuildLeaderboard() {
        await this.redisService.del('leaderboard:global');
        const users = await this.userRepository.find({
            where: { isBanned: false },
            order: { followers: 'DESC' },
            take: 10000,
        });
        const pipeline = this.redisService.pipeline();
        for (const user of users) {
            pipeline.zadd('leaderboard:global', Number(user.followers), user.id);
        }
        await pipeline.exec();
    }
};
exports.GetLeaderboardUseCase = GetLeaderboardUseCase;
exports.GetLeaderboardUseCase = GetLeaderboardUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        redis_service_1.RedisService])
], GetLeaderboardUseCase);
//# sourceMappingURL=get-leaderboard.use-case.js.map