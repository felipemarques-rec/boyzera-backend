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
exports.AdminChallengesController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const challenge_entity_1 = require("../../domain/entities/challenge.entity");
const user_entity_1 = require("../../domain/entities/user.entity");
const admin_auth_guard_1 = require("../guards/admin-auth.guard");
let AdminChallengesController = class AdminChallengesController {
    challengeRepository;
    userRepository;
    constructor(challengeRepository, userRepository) {
        this.challengeRepository = challengeRepository;
        this.userRepository = userRepository;
    }
    async getChallenges(page = 1, limit = 20, type, status, sortBy = 'createdAt', sortOrder = 'DESC') {
        const skip = (page - 1) * limit;
        const queryBuilder = this.challengeRepository
            .createQueryBuilder('challenge')
            .leftJoinAndSelect('challenge.challenger', 'challenger')
            .leftJoinAndSelect('challenge.opponent', 'opponent');
        if (type) {
            queryBuilder.andWhere('challenge.type = :type', { type });
        }
        if (status) {
            queryBuilder.andWhere('challenge.status = :status', { status });
        }
        const validSortFields = ['createdAt', 'betAmount', 'prizePool'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
        queryBuilder.orderBy(`challenge.${sortField}`, sortOrder);
        const [challenges, total] = await queryBuilder
            .skip(skip)
            .take(limit)
            .getManyAndCount();
        return {
            data: challenges.map((c) => ({
                id: c.id,
                type: c.type,
                status: c.status,
                challenger: c.challenger
                    ? {
                        id: c.challenger.id,
                        username: c.challenger.username,
                        firstName: c.challenger.firstName,
                    }
                    : null,
                opponent: c.opponent
                    ? {
                        id: c.opponent.id,
                        username: c.opponent.username,
                        firstName: c.opponent.firstName,
                    }
                    : null,
                betAmount: c.betAmount.toString(),
                prizePool: c.prizePool.toString(),
                config: c.config,
                result: c.result,
                startedAt: c.startedAt,
                endedAt: c.endedAt,
                createdAt: c.createdAt,
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
        const total = await this.challengeRepository.count();
        const byStatus = {};
        for (const status of Object.values(challenge_entity_1.ChallengeStatus)) {
            byStatus[status] = await this.challengeRepository.count({ where: { status } });
        }
        const byType = {};
        for (const type of Object.values(challenge_entity_1.ChallengeType)) {
            byType[type] = await this.challengeRepository.count({ where: { type } });
        }
        const totalBets = await this.challengeRepository
            .createQueryBuilder('challenge')
            .select('SUM(challenge.betAmount)', 'total')
            .where('challenge.status = :status', { status: challenge_entity_1.ChallengeStatus.COMPLETED })
            .getRawOne();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayChallenges = await this.challengeRepository
            .createQueryBuilder('challenge')
            .where('challenge.createdAt >= :today', { today })
            .getCount();
        const topChallengers = await this.challengeRepository
            .createQueryBuilder('challenge')
            .select('challenge.challengerId', 'userId')
            .addSelect('COUNT(*)', 'count')
            .where('challenge.status = :status', { status: challenge_entity_1.ChallengeStatus.COMPLETED })
            .groupBy('challenge.challengerId')
            .orderBy('count', 'DESC')
            .limit(5)
            .getRawMany();
        const topChallengersWithUsers = await Promise.all(topChallengers.map(async (t) => {
            const user = await this.userRepository.findOne({ where: { id: t.userId } });
            return {
                userId: t.userId,
                username: user?.username,
                firstName: user?.firstName,
                challengeCount: parseInt(t.count),
            };
        }));
        return {
            total,
            todayChallenges,
            totalBetsAmount: totalBets?.total?.toString() || '0',
            byStatus,
            byType,
            topChallengers: topChallengersWithUsers,
        };
    }
    async getChallenge(id) {
        const challenge = await this.challengeRepository.findOne({
            where: { id },
            relations: ['challenger', 'opponent'],
        });
        if (!challenge) {
            return { error: 'Desafio nao encontrado' };
        }
        return {
            ...challenge,
            betAmount: challenge.betAmount.toString(),
            prizePool: challenge.prizePool.toString(),
            challenger: challenge.challenger
                ? {
                    id: challenge.challenger.id,
                    username: challenge.challenger.username,
                    firstName: challenge.challenger.firstName,
                    lastName: challenge.challenger.lastName,
                }
                : null,
            opponent: challenge.opponent
                ? {
                    id: challenge.opponent.id,
                    username: challenge.opponent.username,
                    firstName: challenge.opponent.firstName,
                    lastName: challenge.opponent.lastName,
                }
                : null,
        };
    }
    async getUserChallenges(userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [challenges, total] = await this.challengeRepository
            .createQueryBuilder('challenge')
            .leftJoinAndSelect('challenge.challenger', 'challenger')
            .leftJoinAndSelect('challenge.opponent', 'opponent')
            .where('challenge.challengerId = :userId OR challenge.opponentId = :userId', { userId })
            .orderBy('challenge.createdAt', 'DESC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();
        const user = await this.userRepository.findOne({ where: { id: userId } });
        const wins = challenges.filter((c) => c.result?.winnerId === userId).length;
        const losses = challenges.filter((c) => c.result?.winnerId && c.result.winnerId !== userId).length;
        const ties = challenges.filter((c) => c.status === challenge_entity_1.ChallengeStatus.COMPLETED && !c.result?.winnerId).length;
        return {
            user: user
                ? {
                    id: user.id,
                    username: user.username,
                    firstName: user.firstName,
                }
                : null,
            stats: {
                total: total,
                wins,
                losses,
                ties,
                winRate: total > 0 ? Math.round((wins / total) * 100) : 0,
            },
            data: challenges.map((c) => ({
                id: c.id,
                type: c.type,
                status: c.status,
                challenger: c.challenger
                    ? {
                        id: c.challenger.id,
                        username: c.challenger.username,
                        firstName: c.challenger.firstName,
                    }
                    : null,
                opponent: c.opponent
                    ? {
                        id: c.opponent.id,
                        username: c.opponent.username,
                        firstName: c.opponent.firstName,
                    }
                    : null,
                betAmount: c.betAmount.toString(),
                result: c.result,
                createdAt: c.createdAt,
            })),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
};
exports.AdminChallengesController = AdminChallengesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('type')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('sortBy')),
    __param(5, (0, common_1.Query)('sortOrder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AdminChallengesController.prototype, "getChallenges", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminChallengesController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminChallengesController.prototype, "getChallenge", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], AdminChallengesController.prototype, "getUserChallenges", null);
exports.AdminChallengesController = AdminChallengesController = __decorate([
    (0, common_1.Controller)('admin/challenges'),
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard),
    __param(0, (0, typeorm_1.InjectRepository)(challenge_entity_1.Challenge)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], AdminChallengesController);
//# sourceMappingURL=admin-challenges.controller.js.map