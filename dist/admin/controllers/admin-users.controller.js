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
exports.AdminUsersController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../../domain/entities/user.entity");
const admin_auth_guard_1 = require("../guards/admin-auth.guard");
let AdminUsersController = class AdminUsersController {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async getUsers(page = 1, limit = 20, search, isBanned, level, sortBy = 'createdAt', sortOrder = 'DESC') {
        const skip = (page - 1) * limit;
        const queryBuilder = this.userRepository.createQueryBuilder('user');
        if (search) {
            queryBuilder.andWhere('(user.username ILIKE :search OR user.telegramId ILIKE :search OR user.firstName ILIKE :search)', { search: `%${search}%` });
        }
        if (isBanned !== undefined) {
            queryBuilder.andWhere('user.isBanned = :isBanned', {
                isBanned: isBanned === 'true',
            });
        }
        if (level) {
            queryBuilder.andWhere('user.level = :level', { level });
        }
        const validSortFields = ['createdAt', 'followers', 'level', 'gems', 'totalTaps'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
        queryBuilder.orderBy(`user.${sortField}`, sortOrder);
        const [users, total] = await queryBuilder
            .skip(skip)
            .take(limit)
            .getManyAndCount();
        return {
            data: users.map((user) => ({
                id: user.id,
                telegramId: user.telegramId,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                nickname: user.nickname,
                avatarUrl: user.avatarUrl,
                followers: user.followers.toString(),
                level: user.level,
                energy: user.energy,
                maxEnergy: user.maxEnergy,
                gems: user.gems,
                tokensBz: user.tokensBz,
                totalTaps: user.totalTaps.toString(),
                tapMultiplier: user.tapMultiplier,
                profitPerHour: user.profitPerHour,
                isBanned: user.isBanned,
                banReason: user.banReason,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                lastLoginAt: user.lastLoginAt,
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
        const totalUsers = await this.userRepository.count();
        const bannedUsers = await this.userRepository.count({ where: { isBanned: true } });
        const activeToday = await this.userRepository
            .createQueryBuilder('user')
            .where('user.lastLoginAt >= :date', {
            date: new Date(Date.now() - 24 * 60 * 60 * 1000),
        })
            .getCount();
        const topLevel = await this.userRepository
            .createQueryBuilder('user')
            .select('MAX(user.level)', 'maxLevel')
            .getRawOne();
        return {
            totalUsers,
            bannedUsers,
            activeToday,
            topLevel: topLevel?.maxLevel || 1,
        };
    }
    async getUser(id) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            return { error: 'Usuário não encontrado' };
        }
        return {
            id: user.id,
            telegramId: user.telegramId,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            nickname: user.nickname,
            avatarUrl: user.avatarUrl,
            followers: user.followers.toString(),
            level: user.level,
            energy: user.energy,
            maxEnergy: user.maxEnergy,
            energyRegenRate: user.energyRegenRate,
            gems: user.gems,
            tokensBz: user.tokensBz,
            totalTaps: user.totalTaps.toString(),
            tapMultiplier: user.tapMultiplier,
            profitPerHour: user.profitPerHour,
            combo: user.combo,
            engagement: user.engagement,
            isBanned: user.isBanned,
            banReason: user.banReason,
            referrerId: user.referrerId,
            seasonId: user.seasonId,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            lastLoginAt: user.lastLoginAt,
            lastTapAt: user.lastTapAt,
        };
    }
    async updateUser(id, dto) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            return { error: 'Usuário não encontrado' };
        }
        if (dto.followers !== undefined) {
            user.followers = BigInt(dto.followers);
        }
        if (dto.gems !== undefined) {
            user.gems = dto.gems;
        }
        if (dto.tokensBz !== undefined) {
            user.tokensBz = dto.tokensBz;
        }
        if (dto.energy !== undefined) {
            user.energy = dto.energy;
        }
        if (dto.maxEnergy !== undefined) {
            user.maxEnergy = dto.maxEnergy;
        }
        if (dto.level !== undefined) {
            user.level = dto.level;
        }
        if (dto.tapMultiplier !== undefined) {
            user.tapMultiplier = dto.tapMultiplier;
        }
        if (dto.profitPerHour !== undefined) {
            user.profitPerHour = dto.profitPerHour;
        }
        await this.userRepository.save(user);
        return { success: true, message: 'Usuário atualizado' };
    }
    async banUser(id, dto) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            return { error: 'Usuário não encontrado' };
        }
        user.isBanned = true;
        user.banReason = dto.reason;
        await this.userRepository.save(user);
        return { success: true, message: 'Usuário banido' };
    }
    async unbanUser(id) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            return { error: 'Usuário não encontrado' };
        }
        user.isBanned = false;
        user.banReason = null;
        await this.userRepository.save(user);
        return { success: true, message: 'Usuário desbanido' };
    }
};
exports.AdminUsersController = AdminUsersController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('isBanned')),
    __param(4, (0, common_1.Query)('level')),
    __param(5, (0, common_1.Query)('sortBy')),
    __param(6, (0, common_1.Query)('sortOrder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, Number, String, String]),
    __metadata("design:returntype", Promise)
], AdminUsersController.prototype, "getUsers", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminUsersController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminUsersController.prototype, "getUser", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminUsersController.prototype, "updateUser", null);
__decorate([
    (0, common_1.Post)(':id/ban'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminUsersController.prototype, "banUser", null);
__decorate([
    (0, common_1.Post)(':id/unban'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminUsersController.prototype, "unbanUser", null);
exports.AdminUsersController = AdminUsersController = __decorate([
    (0, common_1.Controller)('admin/users'),
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AdminUsersController);
//# sourceMappingURL=admin-users.controller.js.map