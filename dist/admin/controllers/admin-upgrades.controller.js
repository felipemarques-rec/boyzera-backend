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
exports.AdminUpgradesController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const upgrade_entity_1 = require("../../domain/entities/upgrade.entity");
const admin_auth_guard_1 = require("../guards/admin-auth.guard");
let AdminUpgradesController = class AdminUpgradesController {
    upgradeRepository;
    constructor(upgradeRepository) {
        this.upgradeRepository = upgradeRepository;
    }
    async getUpgrades(category, isActive) {
        const queryBuilder = this.upgradeRepository.createQueryBuilder('upgrade');
        if (category) {
            queryBuilder.andWhere('upgrade.category = :category', { category });
        }
        if (isActive !== undefined) {
            queryBuilder.andWhere('upgrade.isActive = :isActive', {
                isActive: isActive === 'true',
            });
        }
        queryBuilder.orderBy('upgrade.sortOrder', 'ASC');
        const upgrades = await queryBuilder.getMany();
        return {
            data: upgrades.map((u) => ({
                ...u,
                baseCost: u.baseCost.toString(),
            })),
            total: upgrades.length,
        };
    }
    async getStats() {
        const total = await this.upgradeRepository.count();
        const active = await this.upgradeRepository.count({ where: { isActive: true } });
        const byCategory = {};
        for (const category of Object.values(upgrade_entity_1.UpgradeCategory)) {
            byCategory[category] = await this.upgradeRepository.count({ where: { category } });
        }
        return {
            total,
            active,
            inactive: total - active,
            byCategory,
        };
    }
    async getUpgrade(id) {
        const upgrade = await this.upgradeRepository.findOne({ where: { id } });
        if (!upgrade) {
            return { error: 'Upgrade nao encontrado' };
        }
        return {
            ...upgrade,
            baseCost: upgrade.baseCost.toString(),
        };
    }
    async createUpgrade(dto) {
        const upgrade = this.upgradeRepository.create({
            ...dto,
            baseCost: BigInt(dto.baseCost),
            costMultiplier: dto.costMultiplier ?? 1.15,
            effectMultiplier: dto.effectMultiplier ?? 1.1,
            requiredLevel: dto.requiredLevel ?? 1,
            maxLevel: dto.maxLevel ?? 100,
            sortOrder: dto.sortOrder ?? 0,
            isActive: dto.isActive ?? true,
        });
        await this.upgradeRepository.save(upgrade);
        return { success: true, message: 'Upgrade criado', data: { ...upgrade, baseCost: upgrade.baseCost.toString() } };
    }
    async updateUpgrade(id, dto) {
        const upgrade = await this.upgradeRepository.findOne({ where: { id } });
        if (!upgrade) {
            return { error: 'Upgrade nao encontrado' };
        }
        if (dto.baseCost !== undefined) {
            upgrade.baseCost = BigInt(dto.baseCost);
            delete dto.baseCost;
        }
        Object.assign(upgrade, dto);
        await this.upgradeRepository.save(upgrade);
        return { success: true, message: 'Upgrade atualizado' };
    }
    async deleteUpgrade(id) {
        const upgrade = await this.upgradeRepository.findOne({ where: { id } });
        if (!upgrade) {
            return { error: 'Upgrade nao encontrado' };
        }
        await this.upgradeRepository.remove(upgrade);
        return { success: true, message: 'Upgrade excluido' };
    }
    async toggleUpgrade(id) {
        const upgrade = await this.upgradeRepository.findOne({ where: { id } });
        if (!upgrade) {
            return { error: 'Upgrade nao encontrado' };
        }
        upgrade.isActive = !upgrade.isActive;
        await this.upgradeRepository.save(upgrade);
        return { success: true, message: upgrade.isActive ? 'Upgrade ativado' : 'Upgrade desativado' };
    }
};
exports.AdminUpgradesController = AdminUpgradesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('category')),
    __param(1, (0, common_1.Query)('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminUpgradesController.prototype, "getUpgrades", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminUpgradesController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminUpgradesController.prototype, "getUpgrade", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminUpgradesController.prototype, "createUpgrade", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminUpgradesController.prototype, "updateUpgrade", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminUpgradesController.prototype, "deleteUpgrade", null);
__decorate([
    (0, common_1.Post)(':id/toggle'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminUpgradesController.prototype, "toggleUpgrade", null);
exports.AdminUpgradesController = AdminUpgradesController = __decorate([
    (0, common_1.Controller)('admin/upgrades'),
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard),
    __param(0, (0, typeorm_1.InjectRepository)(upgrade_entity_1.Upgrade)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AdminUpgradesController);
//# sourceMappingURL=admin-upgrades.controller.js.map