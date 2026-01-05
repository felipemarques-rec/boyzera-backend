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
exports.GetReferralStatsUseCase = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../../domain/entities/user.entity");
const referral_entity_1 = require("../../domain/entities/referral.entity");
let GetReferralStatsUseCase = class GetReferralStatsUseCase {
    userRepository;
    referralRepository;
    milestones = [
        { count: 5, reward: { gems: 50 } },
        { count: 10, reward: { gems: 100 } },
        { count: 25, reward: { gems: 250 } },
        { count: 50, reward: { gems: 500 } },
        { count: 100, reward: { gems: 1000 } },
    ];
    constructor(userRepository, referralRepository) {
        this.userRepository = userRepository;
        this.referralRepository = referralRepository;
    }
    async execute(userId) {
        const referrals = await this.referralRepository.find({
            where: { referrerId: userId },
            relations: ['referred'],
            order: { createdAt: 'DESC' },
        });
        const totalReferrals = referrals.length;
        let totalEarnedFollowers = BigInt(0);
        const referralInfos = [];
        for (const ref of referrals) {
            totalEarnedFollowers += ref.totalEarnedFollowers;
            referralInfos.push({
                id: ref.referredId,
                username: ref.referred?.username || null,
                firstName: ref.referred?.firstName || null,
                followers: ref.referred?.followers.toString() || '0',
                earnedFromReferral: ref.totalEarnedFollowers.toString(),
                joinedAt: ref.createdAt,
            });
        }
        const milestoneInfos = this.milestones.map((m) => ({
            ...m,
            achieved: totalReferrals >= m.count,
        }));
        return {
            totalReferrals,
            totalEarnedFollowers: totalEarnedFollowers.toString(),
            referrals: referralInfos,
            milestones: milestoneInfos,
        };
    }
    async getReferralLeaderboard(limit = 50) {
        const result = await this.referralRepository
            .createQueryBuilder('referral')
            .select('referral.referrerId', 'userId')
            .addSelect('COUNT(*)', 'count')
            .groupBy('referral.referrerId')
            .orderBy('count', 'DESC')
            .limit(limit)
            .getRawMany();
        const userIds = result.map((r) => r.userId);
        const users = await this.userRepository.findByIds(userIds);
        const userMap = new Map(users.map((u) => [u.id, u.username]));
        return result.map((r) => ({
            userId: r.userId,
            count: parseInt(r.count, 10),
            username: userMap.get(r.userId) || null,
        }));
    }
};
exports.GetReferralStatsUseCase = GetReferralStatsUseCase;
exports.GetReferralStatsUseCase = GetReferralStatsUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(referral_entity_1.Referral)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], GetReferralStatsUseCase);
//# sourceMappingURL=get-referral-stats.use-case.js.map