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
exports.SquadController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const squad_service_1 = require("../../domain/services/squad.service");
class CreateSquadDto {
    name;
    description;
}
class UpdateSquadDto {
    name;
    description;
    imageUrl;
    bannerUrl;
    isOpen;
}
let SquadController = class SquadController {
    squadService;
    constructor(squadService) {
        this.squadService = squadService;
    }
    async createSquad(req, dto) {
        const squad = await this.squadService.createSquad(req.user.id, dto.name, dto.description);
        return {
            id: squad.id,
            name: squad.name,
            description: squad.description,
            level: squad.level,
            memberCount: squad.memberCount,
            maxMembers: squad.maxMembers,
            isOpen: squad.isOpen,
        };
    }
    async getMySquad(req) {
        const squad = await this.squadService.getUserSquad(req.user.id);
        if (!squad) {
            return { squad: null };
        }
        const members = await this.squadService.getSquadMembers(squad.id);
        return {
            squad: {
                id: squad.id,
                name: squad.name,
                description: squad.description,
                imageUrl: squad.imageUrl,
                bannerUrl: squad.bannerUrl,
                level: squad.level,
                totalFollowers: squad.totalFollowers.toString(),
                memberCount: squad.memberCount,
                maxMembers: squad.maxMembers,
                isOpen: squad.isOpen,
                isVerified: squad.isVerified,
                owner: {
                    id: squad.owner.id,
                    username: squad.owner.username,
                    nickname: squad.owner.nickname,
                    avatarUrl: squad.owner.avatarUrl,
                },
            },
            members: members.map((m) => ({
                id: m.id,
                role: m.role,
                joinedAt: m.joinedAt,
                contributedFollowers: m.contributedFollowers.toString(),
                user: {
                    id: m.user.id,
                    username: m.user.username,
                    nickname: m.user.nickname,
                    avatarUrl: m.user.avatarUrl,
                    level: m.user.level,
                    followers: m.user.followers.toString(),
                },
            })),
        };
    }
    async getSquad(id) {
        const squad = await this.squadService.getSquadById(id);
        if (!squad) {
            return { squad: null };
        }
        const members = await this.squadService.getSquadMembers(squad.id);
        return {
            squad: {
                id: squad.id,
                name: squad.name,
                description: squad.description,
                imageUrl: squad.imageUrl,
                bannerUrl: squad.bannerUrl,
                level: squad.level,
                totalFollowers: squad.totalFollowers.toString(),
                memberCount: squad.memberCount,
                maxMembers: squad.maxMembers,
                isOpen: squad.isOpen,
                isVerified: squad.isVerified,
                owner: {
                    id: squad.owner.id,
                    username: squad.owner.username,
                    nickname: squad.owner.nickname,
                    avatarUrl: squad.owner.avatarUrl,
                },
            },
            members: members.map((m) => ({
                id: m.id,
                role: m.role,
                joinedAt: m.joinedAt,
                contributedFollowers: m.contributedFollowers.toString(),
                user: {
                    id: m.user.id,
                    username: m.user.username,
                    nickname: m.user.nickname,
                    avatarUrl: m.user.avatarUrl,
                    level: m.user.level,
                    followers: m.user.followers.toString(),
                },
            })),
        };
    }
    async getSquadMembers(id) {
        const members = await this.squadService.getSquadMembers(id);
        return {
            members: members.map((m) => ({
                id: m.id,
                role: m.role,
                joinedAt: m.joinedAt,
                contributedFollowers: m.contributedFollowers.toString(),
                user: {
                    id: m.user.id,
                    username: m.user.username,
                    nickname: m.user.nickname,
                    avatarUrl: m.user.avatarUrl,
                    level: m.user.level,
                    followers: m.user.followers.toString(),
                },
            })),
        };
    }
    async joinSquad(req, id) {
        const membership = await this.squadService.joinSquad(req.user.id, id);
        return {
            success: true,
            membership: {
                id: membership.id,
                role: membership.role,
                joinedAt: membership.joinedAt,
            },
        };
    }
    async leaveSquad(req) {
        await this.squadService.leaveSquad(req.user.id);
        return { success: true };
    }
    async updateSquad(req, id, dto) {
        const squad = await this.squadService.updateSquad(id, req.user.id, dto);
        return {
            id: squad.id,
            name: squad.name,
            description: squad.description,
            imageUrl: squad.imageUrl,
            bannerUrl: squad.bannerUrl,
            isOpen: squad.isOpen,
        };
    }
    async searchSquads(query, limit) {
        if (query) {
            const squads = await this.squadService.searchSquads(query, limit || 20);
            return {
                squads: squads.map((s) => ({
                    id: s.id,
                    name: s.name,
                    description: s.description,
                    imageUrl: s.imageUrl,
                    level: s.level,
                    memberCount: s.memberCount,
                    maxMembers: s.maxMembers,
                    totalFollowers: s.totalFollowers.toString(),
                })),
            };
        }
        const squads = await this.squadService.getTopSquads(limit || 10);
        return {
            squads: squads.map((s) => ({
                id: s.id,
                name: s.name,
                description: s.description,
                imageUrl: s.imageUrl,
                level: s.level,
                memberCount: s.memberCount,
                maxMembers: s.maxMembers,
                totalFollowers: s.totalFollowers.toString(),
                owner: s.owner
                    ? {
                        id: s.owner.id,
                        username: s.owner.username,
                        nickname: s.owner.nickname,
                    }
                    : null,
            })),
        };
    }
};
exports.SquadController = SquadController;
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CreateSquadDto]),
    __metadata("design:returntype", Promise)
], SquadController.prototype, "createSquad", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)('my'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SquadController.prototype, "getMySquad", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SquadController.prototype, "getSquad", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)(':id/members'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SquadController.prototype, "getSquadMembers", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Post)(':id/join'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SquadController.prototype, "joinSquad", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Post)('leave'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SquadController.prototype, "leaveSquad", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, UpdateSquadDto]),
    __metadata("design:returntype", Promise)
], SquadController.prototype, "updateSquad", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], SquadController.prototype, "searchSquads", null);
exports.SquadController = SquadController = __decorate([
    (0, common_1.Controller)('squad'),
    __metadata("design:paramtypes", [squad_service_1.SquadService])
], SquadController);
//# sourceMappingURL=squad.controller.js.map