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
exports.AdminSquadsController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const squad_entity_1 = require("../../domain/entities/squad.entity");
const user_entity_1 = require("../../domain/entities/user.entity");
const admin_auth_guard_1 = require("../guards/admin-auth.guard");
let AdminSquadsController = class AdminSquadsController {
    squadRepository;
    squadMemberRepository;
    userRepository;
    constructor(squadRepository, squadMemberRepository, userRepository) {
        this.squadRepository = squadRepository;
        this.squadMemberRepository = squadMemberRepository;
        this.userRepository = userRepository;
    }
    async getSquads(page = 1, limit = 20, search, isOpen, isVerified, sortBy = 'createdAt', sortOrder = 'DESC') {
        const skip = (page - 1) * limit;
        const queryBuilder = this.squadRepository
            .createQueryBuilder('squad')
            .leftJoinAndSelect('squad.owner', 'owner');
        if (search) {
            queryBuilder.andWhere('squad.name ILIKE :search', { search: `%${search}%` });
        }
        if (isOpen !== undefined) {
            queryBuilder.andWhere('squad.isOpen = :isOpen', { isOpen: isOpen === 'true' });
        }
        if (isVerified !== undefined) {
            queryBuilder.andWhere('squad.isVerified = :isVerified', { isVerified: isVerified === 'true' });
        }
        const validSortFields = ['createdAt', 'memberCount', 'totalFollowers', 'level'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
        queryBuilder.orderBy(`squad.${sortField}`, sortOrder);
        const [squads, total] = await queryBuilder
            .skip(skip)
            .take(limit)
            .getManyAndCount();
        return {
            data: squads.map((s) => ({
                id: s.id,
                name: s.name,
                description: s.description,
                imageUrl: s.imageUrl,
                bannerUrl: s.bannerUrl,
                owner: s.owner
                    ? {
                        id: s.owner.id,
                        username: s.owner.username,
                        firstName: s.owner.firstName,
                    }
                    : null,
                level: s.level,
                totalFollowers: s.totalFollowers.toString(),
                memberCount: s.memberCount,
                maxMembers: s.maxMembers,
                isOpen: s.isOpen,
                isVerified: s.isVerified,
                createdAt: s.createdAt,
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
        const total = await this.squadRepository.count();
        const open = await this.squadRepository.count({ where: { isOpen: true } });
        const verified = await this.squadRepository.count({ where: { isVerified: true } });
        const totalMembers = await this.squadMemberRepository.count();
        const avgMembers = total > 0 ? totalMembers / total : 0;
        const topSquads = await this.squadRepository
            .createQueryBuilder('squad')
            .orderBy('squad.totalFollowers', 'DESC')
            .limit(5)
            .getMany();
        return {
            total,
            open,
            closed: total - open,
            verified,
            totalMembers,
            avgMembersPerSquad: Math.round(avgMembers * 10) / 10,
            topSquads: topSquads.map((s) => ({
                id: s.id,
                name: s.name,
                totalFollowers: s.totalFollowers.toString(),
                memberCount: s.memberCount,
            })),
        };
    }
    async getSquad(id) {
        const squad = await this.squadRepository.findOne({
            where: { id },
            relations: ['owner'],
        });
        if (!squad) {
            return { error: 'Squad nao encontrado' };
        }
        const members = await this.squadMemberRepository.find({
            where: { squadId: id },
            relations: ['user'],
            order: { role: 'ASC', joinedAt: 'ASC' },
        });
        return {
            ...squad,
            totalFollowers: squad.totalFollowers.toString(),
            owner: squad.owner
                ? {
                    id: squad.owner.id,
                    username: squad.owner.username,
                    firstName: squad.owner.firstName,
                }
                : null,
            members: members.map((m) => ({
                id: m.id,
                user: m.user
                    ? {
                        id: m.user.id,
                        username: m.user.username,
                        firstName: m.user.firstName,
                    }
                    : null,
                role: m.role,
                contributedFollowers: m.contributedFollowers.toString(),
                joinedAt: m.joinedAt,
            })),
        };
    }
    async updateSquad(id, dto) {
        const squad = await this.squadRepository.findOne({ where: { id } });
        if (!squad) {
            return { error: 'Squad nao encontrado' };
        }
        Object.assign(squad, dto);
        await this.squadRepository.save(squad);
        return { success: true, message: 'Squad atualizado' };
    }
    async deleteSquad(id) {
        const squad = await this.squadRepository.findOne({ where: { id } });
        if (!squad) {
            return { error: 'Squad nao encontrado' };
        }
        await this.squadMemberRepository.delete({ squadId: id });
        await this.squadRepository.remove(squad);
        return { success: true, message: 'Squad excluido' };
    }
    async verifySquad(id) {
        const squad = await this.squadRepository.findOne({ where: { id } });
        if (!squad) {
            return { error: 'Squad nao encontrado' };
        }
        squad.isVerified = true;
        await this.squadRepository.save(squad);
        return { success: true, message: 'Squad verificado' };
    }
    async unverifySquad(id) {
        const squad = await this.squadRepository.findOne({ where: { id } });
        if (!squad) {
            return { error: 'Squad nao encontrado' };
        }
        squad.isVerified = false;
        await this.squadRepository.save(squad);
        return { success: true, message: 'Verificacao removida' };
    }
    async removeMember(id, memberId) {
        const member = await this.squadMemberRepository.findOne({
            where: { id: memberId, squadId: id },
        });
        if (!member) {
            return { error: 'Membro nao encontrado' };
        }
        if (member.role === 'owner') {
            return { error: 'Nao e possivel remover o dono do squad' };
        }
        await this.squadMemberRepository.remove(member);
        const squad = await this.squadRepository.findOne({ where: { id } });
        if (squad) {
            squad.memberCount = Math.max(0, squad.memberCount - 1);
            await this.squadRepository.save(squad);
        }
        return { success: true, message: 'Membro removido' };
    }
};
exports.AdminSquadsController = AdminSquadsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('isOpen')),
    __param(4, (0, common_1.Query)('isVerified')),
    __param(5, (0, common_1.Query)('sortBy')),
    __param(6, (0, common_1.Query)('sortOrder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AdminSquadsController.prototype, "getSquads", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminSquadsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminSquadsController.prototype, "getSquad", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminSquadsController.prototype, "updateSquad", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminSquadsController.prototype, "deleteSquad", null);
__decorate([
    (0, common_1.Post)(':id/verify'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminSquadsController.prototype, "verifySquad", null);
__decorate([
    (0, common_1.Post)(':id/unverify'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminSquadsController.prototype, "unverifySquad", null);
__decorate([
    (0, common_1.Delete)(':id/members/:memberId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('memberId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminSquadsController.prototype, "removeMember", null);
exports.AdminSquadsController = AdminSquadsController = __decorate([
    (0, common_1.Controller)('admin/squads'),
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard),
    __param(0, (0, typeorm_1.InjectRepository)(squad_entity_1.Squad)),
    __param(1, (0, typeorm_1.InjectRepository)(squad_entity_1.SquadMember)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AdminSquadsController);
//# sourceMappingURL=admin-squads.controller.js.map