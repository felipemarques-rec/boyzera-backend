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
exports.AdminReferralsController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const referral_entity_1 = require("../../domain/entities/referral.entity");
const user_entity_1 = require("../../domain/entities/user.entity");
const admin_auth_guard_1 = require("../guards/admin-auth.guard");
let AdminReferralsController = class AdminReferralsController {
    referralRepository;
    userRepository;
    constructor(referralRepository, userRepository) {
        this.referralRepository = referralRepository;
        this.userRepository = userRepository;
    }
    async getReferrals(page = 1, limit = 20, search, sortBy = 'createdAt', sortOrder = 'DESC') {
        const skip = (page - 1) * limit;
        const queryBuilder = this.referralRepository
            .createQueryBuilder('referral')
            .leftJoinAndSelect('referral.referrer', 'referrer')
            .leftJoinAndSelect('referral.referred', 'referred');
        if (search) {
            queryBuilder.andWhere('(referrer.username ILIKE :search OR referrer.firstName ILIKE :search OR referred.username ILIKE :search OR referred.firstName ILIKE :search)', { search: `%${search}%` });
        }
        const validSortFields = ['createdAt', 'totalEarnedFollowers'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
        queryBuilder.orderBy(`referral.${sortField}`, sortOrder);
        const [referrals, total] = await queryBuilder
            .skip(skip)
            .take(limit)
            .getManyAndCount();
        return {
            data: referrals.map((r) => ({
                id: r.id,
                referrer: r.referrer
                    ? {
                        id: r.referrer.id,
                        username: r.referrer.username,
                        firstName: r.referrer.firstName,
                        lastName: r.referrer.lastName,
                    }
                    : null,
                referred: r.referred
                    ? {
                        id: r.referred.id,
                        username: r.referred.username,
                        firstName: r.referred.firstName,
                        lastName: r.referred.lastName,
                    }
                    : null,
                totalEarnedFollowers: r.totalEarnedFollowers.toString(),
                bonusClaimed: r.bonusClaimed,
                createdAt: r.createdAt,
            })),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getStats() {
        const total = await this.referralRepository.count();
        const bonusClaimed = await this.referralRepository.count({ where: { bonusClaimed: true } });
        const topReferrers = await this.referralRepository
            .createQueryBuilder('referral')
            .select('referral.referrerId', 'referrerId')
            .addSelect('COUNT(*)', 'count')
            .addSelect('SUM(referral.totalEarnedFollowers)', 'totalEarned')
            .groupBy('referral.referrerId')
            .orderBy('count', 'DESC')
            .limit(10)
            .getRawMany();
        const topReferrersWithUsers = await Promise.all(topReferrers.map(async (r) => {
            const user = await this.userRepository.findOne({ where: { id: r.referrerId } });
            return {
                userId: r.referrerId,
                username: user?.username,
                firstName: user?.firstName,
                referralCount: parseInt(r.count),
                totalEarned: r.totalEarned?.toString() || '0',
            };
        }));
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayReferrals = await this.referralRepository
            .createQueryBuilder('referral')
            .where('referral.createdAt >= :today', { today })
            .getCount();
        return {
            total,
            bonusClaimed,
            bonusPending: total - bonusClaimed,
            todayReferrals,
            topReferrers: topReferrersWithUsers,
        };
    }
    async getUserReferrals(userId) {
        const referrals = await this.referralRepository.find({
            where: { referrerId: userId },
            relations: ['referred'],
            order: { createdAt: 'DESC' },
        });
        const user = await this.userRepository.findOne({ where: { id: userId } });
        return {
            user: user
                ? {
                    id: user.id,
                    username: user.username,
                    firstName: user.firstName,
                }
                : null,
            referralCount: referrals.length,
            referrals: referrals.map((r) => ({
                id: r.id,
                referred: r.referred
                    ? {
                        id: r.referred.id,
                        username: r.referred.username,
                        firstName: r.referred.firstName,
                    }
                    : null,
                totalEarnedFollowers: r.totalEarnedFollowers.toString(),
                bonusClaimed: r.bonusClaimed,
                createdAt: r.createdAt,
            })),
        };
    }
};
exports.AdminReferralsController = AdminReferralsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('sortBy')),
    __param(4, (0, common_1.Query)('sortOrder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, String]),
    __metadata("design:returntype", Promise)
], AdminReferralsController.prototype, "getReferrals", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminReferralsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminReferralsController.prototype, "getUserReferrals", null);
exports.AdminReferralsController = AdminReferralsController = __decorate([
    (0, common_1.Controller)('admin/referrals'),
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard),
    __param(0, (0, typeorm_1.InjectRepository)(referral_entity_1.Referral)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], AdminReferralsController);
//# sourceMappingURL=admin-referrals.controller.js.map