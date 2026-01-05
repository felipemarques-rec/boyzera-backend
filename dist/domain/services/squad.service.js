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
exports.SquadService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const squad_entity_1 = require("../entities/squad.entity");
const user_entity_1 = require("../entities/user.entity");
let SquadService = class SquadService {
    squadRepository;
    squadMemberRepository;
    userRepository;
    constructor(squadRepository, squadMemberRepository, userRepository) {
        this.squadRepository = squadRepository;
        this.squadMemberRepository = squadMemberRepository;
        this.userRepository = userRepository;
    }
    async createSquad(userId, name, description) {
        const existingSquad = await this.squadRepository.findOne({
            where: { ownerId: userId },
        });
        if (existingSquad) {
            throw new common_1.BadRequestException('User already owns a squad');
        }
        const squad = this.squadRepository.create({
            name,
            description,
            ownerId: userId,
            memberCount: 1,
        });
        await this.squadRepository.save(squad);
        const member = this.squadMemberRepository.create({
            squadId: squad.id,
            userId,
            role: 'owner',
        });
        await this.squadMemberRepository.save(member);
        return squad;
    }
    async getSquadById(squadId) {
        return this.squadRepository.findOne({
            where: { id: squadId },
            relations: ['owner'],
        });
    }
    async getUserSquad(userId) {
        const membership = await this.squadMemberRepository.findOne({
            where: { userId },
            relations: ['squad', 'squad.owner'],
        });
        return membership?.squad || null;
    }
    async getSquadMembers(squadId) {
        return this.squadMemberRepository.find({
            where: { squadId },
            relations: ['user'],
            order: { joinedAt: 'ASC' },
        });
    }
    async joinSquad(userId, squadId) {
        const existingMembership = await this.squadMemberRepository.findOne({
            where: { userId },
        });
        if (existingMembership) {
            throw new common_1.BadRequestException('User is already in a squad');
        }
        const squad = await this.squadRepository.findOne({
            where: { id: squadId },
        });
        if (!squad) {
            throw new common_1.NotFoundException('Squad not found');
        }
        if (!squad.isOpen) {
            throw new common_1.BadRequestException('Squad is not accepting new members');
        }
        if (squad.memberCount >= squad.maxMembers) {
            throw new common_1.BadRequestException('Squad is full');
        }
        const member = this.squadMemberRepository.create({
            squadId,
            userId,
            role: 'member',
        });
        await this.squadMemberRepository.save(member);
        squad.memberCount += 1;
        await this.squadRepository.save(squad);
        return member;
    }
    async leaveSquad(userId) {
        const membership = await this.squadMemberRepository.findOne({
            where: { userId },
            relations: ['squad'],
        });
        if (!membership) {
            throw new common_1.BadRequestException('User is not in a squad');
        }
        if (membership.role === 'owner') {
            throw new common_1.BadRequestException('Owner cannot leave squad. Transfer ownership or delete squad.');
        }
        await this.squadMemberRepository.remove(membership);
        const squad = membership.squad;
        squad.memberCount -= 1;
        await this.squadRepository.save(squad);
    }
    async updateSquad(squadId, userId, data) {
        const squad = await this.squadRepository.findOne({
            where: { id: squadId },
        });
        if (!squad) {
            throw new common_1.NotFoundException('Squad not found');
        }
        const membership = await this.squadMemberRepository.findOne({
            where: { squadId, userId },
        });
        if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
            throw new common_1.BadRequestException('Not authorized to update squad');
        }
        Object.assign(squad, data);
        return this.squadRepository.save(squad);
    }
    async searchSquads(query, limit = 20) {
        return this.squadRepository
            .createQueryBuilder('squad')
            .where('squad.name ILIKE :query', { query: `%${query}%` })
            .andWhere('squad.isOpen = true')
            .orderBy('squad.memberCount', 'DESC')
            .limit(limit)
            .getMany();
    }
    async getTopSquads(limit = 10) {
        return this.squadRepository.find({
            order: { totalFollowers: 'DESC' },
            take: limit,
            relations: ['owner'],
        });
    }
    async updateSquadStats(squadId) {
        const members = await this.squadMemberRepository.find({
            where: { squadId },
            relations: ['user'],
        });
        let totalFollowers = BigInt(0);
        for (const member of members) {
            totalFollowers += member.user.followers;
        }
        await this.squadRepository.update(squadId, {
            totalFollowers,
            memberCount: members.length,
        });
    }
};
exports.SquadService = SquadService;
exports.SquadService = SquadService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(squad_entity_1.Squad)),
    __param(1, (0, typeorm_1.InjectRepository)(squad_entity_1.SquadMember)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SquadService);
//# sourceMappingURL=squad.service.js.map