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
exports.AdminMissionsController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const mission_entity_1 = require("../../domain/entities/mission.entity");
const admin_auth_guard_1 = require("../guards/admin-auth.guard");
let AdminMissionsController = class AdminMissionsController {
    missionRepository;
    constructor(missionRepository) {
        this.missionRepository = missionRepository;
    }
    async getMissions(type, isActive) {
        const queryBuilder = this.missionRepository.createQueryBuilder('mission');
        if (type) {
            queryBuilder.andWhere('mission.type = :type', { type });
        }
        if (isActive !== undefined) {
            queryBuilder.andWhere('mission.isActive = :isActive', {
                isActive: isActive === 'true',
            });
        }
        queryBuilder.orderBy('mission.sortOrder', 'ASC');
        const missions = await queryBuilder.getMany();
        return {
            data: missions,
            total: missions.length,
        };
    }
    async getStats() {
        const total = await this.missionRepository.count();
        const active = await this.missionRepository.count({ where: { isActive: true } });
        const daily = await this.missionRepository.count({ where: { type: mission_entity_1.MissionType.DAILY } });
        const weekly = await this.missionRepository.count({ where: { type: mission_entity_1.MissionType.WEEKLY } });
        const achievement = await this.missionRepository.count({ where: { type: mission_entity_1.MissionType.ACHIEVEMENT } });
        return {
            total,
            active,
            inactive: total - active,
            byType: {
                daily,
                weekly,
                achievement,
            },
        };
    }
    async getMission(id) {
        const mission = await this.missionRepository.findOne({ where: { id } });
        if (!mission) {
            return { error: 'Missao nao encontrada' };
        }
        return mission;
    }
    async createMission(dto) {
        const mission = this.missionRepository.create({
            ...dto,
            sortOrder: dto.sortOrder ?? 0,
            isActive: dto.isActive ?? true,
            requiredLevel: dto.requiredLevel ?? 1,
        });
        await this.missionRepository.save(mission);
        return { success: true, message: 'Missao criada', data: mission };
    }
    async updateMission(id, dto) {
        const mission = await this.missionRepository.findOne({ where: { id } });
        if (!mission) {
            return { error: 'Missao nao encontrada' };
        }
        Object.assign(mission, dto);
        await this.missionRepository.save(mission);
        return { success: true, message: 'Missao atualizada' };
    }
    async deleteMission(id) {
        const mission = await this.missionRepository.findOne({ where: { id } });
        if (!mission) {
            return { error: 'Missao nao encontrada' };
        }
        await this.missionRepository.remove(mission);
        return { success: true, message: 'Missao excluida' };
    }
    async toggleMission(id) {
        const mission = await this.missionRepository.findOne({ where: { id } });
        if (!mission) {
            return { error: 'Missao nao encontrada' };
        }
        mission.isActive = !mission.isActive;
        await this.missionRepository.save(mission);
        return { success: true, message: mission.isActive ? 'Missao ativada' : 'Missao desativada' };
    }
};
exports.AdminMissionsController = AdminMissionsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Query)('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminMissionsController.prototype, "getMissions", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminMissionsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminMissionsController.prototype, "getMission", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminMissionsController.prototype, "createMission", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminMissionsController.prototype, "updateMission", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminMissionsController.prototype, "deleteMission", null);
__decorate([
    (0, common_1.Post)(':id/toggle'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminMissionsController.prototype, "toggleMission", null);
exports.AdminMissionsController = AdminMissionsController = __decorate([
    (0, common_1.Controller)('admin/missions'),
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard),
    __param(0, (0, typeorm_1.InjectRepository)(mission_entity_1.Mission)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AdminMissionsController);
//# sourceMappingURL=admin-missions.controller.js.map