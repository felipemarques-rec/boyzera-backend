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
exports.AdminLevelsController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const level_entity_1 = require("../../domain/entities/level.entity");
const admin_auth_guard_1 = require("../guards/admin-auth.guard");
const admin_user_entity_1 = require("../entities/admin-user.entity");
let AdminLevelsController = class AdminLevelsController {
    levelRepository;
    constructor(levelRepository) {
        this.levelRepository = levelRepository;
    }
    async getLevels() {
        const levels = await this.levelRepository.find({
            order: { value: 'ASC' },
        });
        return {
            data: levels.map((level) => ({
                value: level.value,
                name: level.name,
                requiredFollowers: level.requiredFollowers.toString(),
                maxEnergy: level.maxEnergy,
                energyRegenRate: level.energyRegenRate,
                tapMultiplier: level.tapMultiplier,
                rewardGems: level.rewardGems,
                rewardFollowers: level.rewardFollowers.toString(),
                skinUnlock: level.skinUnlock,
                description: level.description,
            })),
            total: levels.length,
        };
    }
    async getLevel(value) {
        const level = await this.levelRepository.findOne({ where: { value } });
        if (!level) {
            return { error: 'Nível não encontrado' };
        }
        return {
            value: level.value,
            name: level.name,
            requiredFollowers: level.requiredFollowers.toString(),
            maxEnergy: level.maxEnergy,
            energyRegenRate: level.energyRegenRate,
            tapMultiplier: level.tapMultiplier,
            rewardGems: level.rewardGems,
            rewardFollowers: level.rewardFollowers.toString(),
            skinUnlock: level.skinUnlock,
            description: level.description,
        };
    }
    async createLevel(dto) {
        const existing = await this.levelRepository.findOne({
            where: { value: dto.value },
        });
        if (existing) {
            return { error: 'Nível com este valor já existe' };
        }
        const level = this.levelRepository.create({
            value: dto.value,
            name: dto.name,
            requiredFollowers: BigInt(dto.requiredFollowers || '0'),
            maxEnergy: dto.maxEnergy,
            energyRegenRate: dto.energyRegenRate,
            tapMultiplier: dto.tapMultiplier,
            rewardGems: dto.rewardGems || 0,
            rewardFollowers: BigInt(dto.rewardFollowers || '0'),
            skinUnlock: dto.skinUnlock,
            description: dto.description,
        });
        await this.levelRepository.save(level);
        return { success: true, message: 'Nível criado', value: level.value };
    }
    async updateLevel(value, dto) {
        const level = await this.levelRepository.findOne({ where: { value } });
        if (!level) {
            return { error: 'Nível não encontrado' };
        }
        if (dto.name !== undefined) {
            level.name = dto.name;
        }
        if (dto.requiredFollowers !== undefined) {
            level.requiredFollowers = BigInt(dto.requiredFollowers);
        }
        if (dto.maxEnergy !== undefined) {
            level.maxEnergy = dto.maxEnergy;
        }
        if (dto.energyRegenRate !== undefined) {
            level.energyRegenRate = dto.energyRegenRate;
        }
        if (dto.tapMultiplier !== undefined) {
            level.tapMultiplier = dto.tapMultiplier;
        }
        if (dto.rewardGems !== undefined) {
            level.rewardGems = dto.rewardGems;
        }
        if (dto.rewardFollowers !== undefined) {
            level.rewardFollowers = BigInt(dto.rewardFollowers);
        }
        if (dto.skinUnlock !== undefined) {
            level.skinUnlock = dto.skinUnlock;
        }
        if (dto.description !== undefined) {
            level.description = dto.description;
        }
        await this.levelRepository.save(level);
        return { success: true, message: 'Nível atualizado' };
    }
    async deleteLevel(value) {
        const level = await this.levelRepository.findOne({ where: { value } });
        if (!level) {
            return { error: 'Nível não encontrado' };
        }
        await this.levelRepository.remove(level);
        return { success: true, message: 'Nível deletado' };
    }
};
exports.AdminLevelsController = AdminLevelsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminLevelsController.prototype, "getLevels", null);
__decorate([
    (0, common_1.Get)(':value'),
    __param(0, (0, common_1.Param)('value', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminLevelsController.prototype, "getLevel", null);
__decorate([
    (0, common_1.Post)(),
    (0, admin_auth_guard_1.AdminRoles)(admin_user_entity_1.AdminRole.SUPER_ADMIN, admin_user_entity_1.AdminRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminLevelsController.prototype, "createLevel", null);
__decorate([
    (0, common_1.Patch)(':value'),
    (0, admin_auth_guard_1.AdminRoles)(admin_user_entity_1.AdminRole.SUPER_ADMIN, admin_user_entity_1.AdminRole.ADMIN),
    __param(0, (0, common_1.Param)('value', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], AdminLevelsController.prototype, "updateLevel", null);
__decorate([
    (0, common_1.Delete)(':value'),
    (0, admin_auth_guard_1.AdminRoles)(admin_user_entity_1.AdminRole.SUPER_ADMIN),
    __param(0, (0, common_1.Param)('value', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminLevelsController.prototype, "deleteLevel", null);
exports.AdminLevelsController = AdminLevelsController = __decorate([
    (0, common_1.Controller)('admin/levels'),
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard),
    __param(0, (0, typeorm_1.InjectRepository)(level_entity_1.Level)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AdminLevelsController);
//# sourceMappingURL=admin-levels.controller.js.map