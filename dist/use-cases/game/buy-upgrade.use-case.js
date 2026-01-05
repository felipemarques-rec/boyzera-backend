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
exports.BuyUpgradeUseCase = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const user_entity_1 = require("../../domain/entities/user.entity");
const upgrade_entity_1 = require("../../domain/entities/upgrade.entity");
const user_upgrade_entity_1 = require("../../domain/entities/user-upgrade.entity");
const redis_service_1 = require("../../infrastructure/redis/redis.service");
let BuyUpgradeUseCase = class BuyUpgradeUseCase {
    userRepository;
    upgradeRepository;
    userUpgradeRepository;
    dataSource;
    redisService;
    eventEmitter;
    constructor(userRepository, upgradeRepository, userUpgradeRepository, dataSource, redisService, eventEmitter) {
        this.userRepository = userRepository;
        this.upgradeRepository = upgradeRepository;
        this.userUpgradeRepository = userUpgradeRepository;
        this.dataSource = dataSource;
        this.redisService = redisService;
        this.eventEmitter = eventEmitter;
    }
    async execute(userId, upgradeId) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const user = await queryRunner.manager.findOne(user_entity_1.User, {
                where: { id: userId },
            });
            const upgrade = await queryRunner.manager.findOne(upgrade_entity_1.Upgrade, {
                where: { id: upgradeId },
            });
            if (!user || !upgrade) {
                throw new common_1.BadRequestException('User or Upgrade not found');
            }
            if (!upgrade.isActive) {
                throw new common_1.BadRequestException('Upgrade is not available');
            }
            if (user.level < upgrade.requiredLevel) {
                throw new common_1.BadRequestException(`Requires level ${upgrade.requiredLevel}. Current level: ${user.level}`);
            }
            let userUpgrade = await queryRunner.manager.findOne(user_upgrade_entity_1.UserUpgrade, {
                where: { userId, upgradeId },
            });
            const currentLevel = userUpgrade ? userUpgrade.level : 0;
            if (currentLevel >= upgrade.maxLevel) {
                throw new common_1.BadRequestException('Upgrade is at max level');
            }
            const cost = upgrade.getCostAtLevel(currentLevel);
            const effect = upgrade.getEffectAtLevel(currentLevel + 1);
            if (user.followers < cost) {
                throw new common_1.BadRequestException(`Insufficient funds. Need: ${cost}, Have: ${user.followers}`);
            }
            user.followers = user.followers - cost;
            switch (upgrade.effectType) {
                case upgrade_entity_1.UpgradeEffectType.PASSIVE_INCOME:
                    user.profitPerHour += effect;
                    break;
                case upgrade_entity_1.UpgradeEffectType.TAP_MULTIPLIER:
                    user.tapMultiplier += Math.floor(effect);
                    break;
                case upgrade_entity_1.UpgradeEffectType.ENERGY_MAX:
                    user.maxEnergy += Math.floor(effect);
                    break;
                case upgrade_entity_1.UpgradeEffectType.ENERGY_REGEN:
                    user.energyRegenRate += effect;
                    break;
            }
            await queryRunner.manager.save(user);
            if (userUpgrade) {
                userUpgrade.level += 1;
                await queryRunner.manager.save(userUpgrade);
            }
            else {
                userUpgrade = queryRunner.manager.create(user_upgrade_entity_1.UserUpgrade, {
                    userId,
                    upgradeId,
                    level: 1,
                });
                await queryRunner.manager.save(userUpgrade);
            }
            await queryRunner.commitTransaction();
            await this.redisService.zadd('leaderboard:global', Number(user.followers), user.id);
            this.eventEmitter.emit('game.upgrade', {
                userId: user.id,
                upgradeId: upgrade.id,
                upgradeName: upgrade.name,
                newLevel: userUpgrade.level,
                cost: cost.toString(),
                effect,
            });
            return {
                success: true,
                upgrade,
                newLevel: userUpgrade.level,
                cost: cost.toString(),
                effect,
                newFollowers: user.followers.toString(),
            };
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
    }
};
exports.BuyUpgradeUseCase = BuyUpgradeUseCase;
exports.BuyUpgradeUseCase = BuyUpgradeUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(upgrade_entity_1.Upgrade)),
    __param(2, (0, typeorm_1.InjectRepository)(user_upgrade_entity_1.UserUpgrade)),
    __param(3, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource,
        redis_service_1.RedisService,
        event_emitter_1.EventEmitter2])
], BuyUpgradeUseCase);
//# sourceMappingURL=buy-upgrade.use-case.js.map