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
exports.GetUpgradesUseCase = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const upgrade_entity_1 = require("../../domain/entities/upgrade.entity");
const user_upgrade_entity_1 = require("../../domain/entities/user-upgrade.entity");
let GetUpgradesUseCase = class GetUpgradesUseCase {
    upgradeRepository;
    userUpgradeRepository;
    constructor(upgradeRepository, userUpgradeRepository) {
        this.upgradeRepository = upgradeRepository;
        this.userUpgradeRepository = userUpgradeRepository;
    }
    async execute(category) {
        const where = { isActive: true };
        if (category &&
            Object.values(upgrade_entity_1.UpgradeCategory).includes(category)) {
            where.category = category;
        }
        return this.upgradeRepository.find({
            where,
            order: {
                category: 'ASC',
                sortOrder: 'ASC',
                requiredLevel: 'ASC',
            },
        });
    }
    async executeWithUserData(userId, category, userFollowers) {
        const upgrades = await this.execute(category);
        const userUpgrades = await this.userUpgradeRepository.find({
            where: { userId },
        });
        const userUpgradeMap = new Map(userUpgrades.map((uu) => [uu.upgradeId, uu.level]));
        return upgrades.map((upgrade) => {
            const userLevel = userUpgradeMap.get(upgrade.id) || 0;
            const nextCost = upgrade.getCostAtLevel(userLevel);
            const nextEffect = upgrade.getEffectAtLevel(userLevel + 1);
            return {
                id: upgrade.id,
                name: upgrade.name,
                description: upgrade.description,
                category: upgrade.category,
                effectType: upgrade.effectType,
                baseCost: upgrade.baseCost.toString(),
                baseEffect: upgrade.baseEffect,
                costMultiplier: upgrade.costMultiplier,
                effectMultiplier: upgrade.effectMultiplier,
                requiredLevel: upgrade.requiredLevel,
                maxLevel: upgrade.maxLevel,
                imageUrl: upgrade.imageUrl,
                iconName: upgrade.iconName,
                sortOrder: upgrade.sortOrder,
                isActive: upgrade.isActive,
                userLevel,
                nextCost: nextCost.toString(),
                nextEffect,
                canAfford: userFollowers !== undefined ? userFollowers >= nextCost : undefined,
            };
        });
    }
    async getByCategory(category) {
        return this.upgradeRepository.find({
            where: { category, isActive: true },
            order: { sortOrder: 'ASC', requiredLevel: 'ASC' },
        });
    }
    async getById(id) {
        return this.upgradeRepository.findOne({ where: { id } });
    }
};
exports.GetUpgradesUseCase = GetUpgradesUseCase;
exports.GetUpgradesUseCase = GetUpgradesUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(upgrade_entity_1.Upgrade)),
    __param(1, (0, typeorm_1.InjectRepository)(user_upgrade_entity_1.UserUpgrade)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], GetUpgradesUseCase);
//# sourceMappingURL=get-upgrades.use-case.js.map