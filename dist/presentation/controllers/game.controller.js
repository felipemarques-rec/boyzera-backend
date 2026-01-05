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
exports.GameController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tap_use_case_1 = require("../../use-cases/game/tap.use-case");
const get_upgrades_use_case_1 = require("../../use-cases/game/get-upgrades.use-case");
const buy_upgrade_use_case_1 = require("../../use-cases/game/buy-upgrade.use-case");
const get_leaderboard_use_case_1 = require("../../use-cases/game/get-leaderboard.use-case");
const collect_passive_income_use_case_1 = require("../../use-cases/game/collect-passive-income.use-case");
const energy_service_1 = require("../../domain/services/energy.service");
const level_service_1 = require("../../domain/services/level.service");
const passive_income_service_1 = require("../../domain/services/passive-income.service");
const user_entity_1 = require("../../domain/entities/user.entity");
const guards_1 = require("../../infrastructure/guards");
const buy_upgrade_dto_1 = require("./buy-upgrade.dto");
const tap_dto_1 = require("../dtos/tap.dto");
let GameController = class GameController {
    tapUseCase;
    getUpgradesUseCase;
    buyUpgradeUseCase;
    getLeaderboardUseCase;
    collectPassiveIncomeUseCase;
    energyService;
    levelService;
    passiveIncomeService;
    userRepository;
    constructor(tapUseCase, getUpgradesUseCase, buyUpgradeUseCase, getLeaderboardUseCase, collectPassiveIncomeUseCase, energyService, levelService, passiveIncomeService, userRepository) {
        this.tapUseCase = tapUseCase;
        this.getUpgradesUseCase = getUpgradesUseCase;
        this.buyUpgradeUseCase = buyUpgradeUseCase;
        this.getLeaderboardUseCase = getLeaderboardUseCase;
        this.collectPassiveIncomeUseCase = collectPassiveIncomeUseCase;
        this.energyService = energyService;
        this.levelService = levelService;
        this.passiveIncomeService = passiveIncomeService;
        this.userRepository = userRepository;
    }
    async tap(req) {
        return this.tapUseCase.execute(req.user.id);
    }
    async tapBatch(req, dto) {
        return this.tapUseCase.execute(req.user.id, dto);
    }
    async getInitialData(req) {
        console.log('=== GET /game/initial-data ===');
        console.log('User ID:', req.user.id);
        const user = await this.userRepository.findOne({
            where: { id: req.user.id },
        });
        if (!user) {
            throw new Error('User not found');
        }
        console.log('User energy from DB:', user.energy);
        console.log('User maxEnergy from DB:', user.maxEnergy);
        const energyState = this.energyService.calculateCurrentEnergy(user);
        console.log('Calculated energyState:', energyState);
        const levelProgress = await this.levelService.getProgressToNextLevel(user);
        const passiveIncomeResult = this.passiveIncomeService.calculatePassiveIncome(user);
        const levels = await this.levelService.getAllLevels();
        return {
            user: {
                id: user.id,
                telegramId: user.telegramId,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                nickname: user.nickname,
                avatarUrl: user.avatarUrl,
                followers: user.followers.toString(),
                level: user.level,
                gems: user.gems,
                tokensBz: user.tokensBz,
                tapMultiplier: user.tapMultiplier,
                combo: user.combo,
                engagement: user.engagement || 0,
                isBanned: user.isBanned,
            },
            energy: {
                current: energyState.currentEnergy,
                max: energyState.maxEnergy,
                regenRate: user.energyRegenRate,
                secondsUntilFull: energyState.secondsUntilFull,
            },
            levelProgress: {
                currentLevel: user.level,
                progress: levelProgress.current.toString(),
                required: levelProgress.required.toString(),
                percentage: levelProgress.percentage,
            },
            passiveIncome: {
                hourlyRate: user.profitPerHour,
                pendingCollection: passiveIncomeResult.earnedFollowers.toString(),
                hoursOffline: passiveIncomeResult.cappedHours,
                maxOfflineHours: this.passiveIncomeService.getMaxOfflineHours(),
            },
            levels: levels.map((l) => ({
                value: l.value,
                name: l.name,
                requiredFollowers: l.requiredFollowers.toString(),
                maxEnergy: l.maxEnergy,
                tapMultiplier: l.tapMultiplier,
            })),
        };
    }
    async collectOfflineIncome(req) {
        return this.collectPassiveIncomeUseCase.execute(req.user.id);
    }
    async getUserStats(req) {
        const user = await this.userRepository.findOne({
            where: { id: req.user.id },
        });
        if (!user) {
            throw new Error('User not found');
        }
        const energyState = this.energyService.calculateCurrentEnergy(user);
        const levelProgress = await this.levelService.getProgressToNextLevel(user);
        return {
            followers: user.followers.toString(),
            level: user.level,
            energy: energyState.currentEnergy,
            maxEnergy: energyState.maxEnergy,
            gems: user.gems,
            tokensBz: user.tokensBz,
            totalTaps: user.totalTaps.toString(),
            tapMultiplier: user.tapMultiplier,
            profitPerHour: user.profitPerHour,
            combo: user.combo,
            levelProgress: {
                percentage: levelProgress.percentage,
                current: levelProgress.current.toString(),
                required: levelProgress.required.toString(),
            },
        };
    }
    async getLevels() {
        const levels = await this.levelService.getAllLevels();
        return levels.map((l) => ({
            value: l.value,
            name: l.name,
            requiredFollowers: l.requiredFollowers.toString(),
            maxEnergy: l.maxEnergy,
            energyRegenRate: l.energyRegenRate,
            tapMultiplier: l.tapMultiplier,
            rewardGems: l.rewardGems,
            rewardFollowers: l.rewardFollowers.toString(),
            skinUnlock: l.skinUnlock,
            description: l.description,
        }));
    }
    async getUpgrades(category) {
        return this.getUpgradesUseCase.execute(category);
    }
    async buyUpgrade(req, dto) {
        return this.buyUpgradeUseCase.execute(req.user.id, dto.upgradeId);
    }
    async getLeaderboard(type = 'global', limit = 100) {
        return this.getLeaderboardUseCase.execute(type, limit);
    }
};
exports.GameController = GameController;
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), guards_1.TapRateLimitGuard, guards_1.AntiCheatGuard),
    (0, common_1.Post)('tap'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "tap", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), guards_1.TapRateLimitGuard, guards_1.AntiCheatGuard),
    (0, common_1.Post)('tap/batch'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(new common_1.ValidationPipe({ transform: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, tap_dto_1.BatchTapDto]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "tapBatch", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)('initial-data'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "getInitialData", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Post)('collect-offline'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "collectOfflineIncome", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)('user/stats'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "getUserStats", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)('levels'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GameController.prototype, "getLevels", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)('upgrades'),
    __param(0, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "getUpgrades", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Post)('upgrade/buy'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, buy_upgrade_dto_1.BuyUpgradeDto]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "buyUpgrade", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)('leaderboard'),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "getLeaderboard", null);
exports.GameController = GameController = __decorate([
    (0, common_1.Controller)('game'),
    __param(8, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [tap_use_case_1.TapUseCase,
        get_upgrades_use_case_1.GetUpgradesUseCase,
        buy_upgrade_use_case_1.BuyUpgradeUseCase,
        get_leaderboard_use_case_1.GetLeaderboardUseCase,
        collect_passive_income_use_case_1.CollectPassiveIncomeUseCase,
        energy_service_1.EnergyService,
        level_service_1.LevelService,
        passive_income_service_1.PassiveIncomeService,
        typeorm_2.Repository])
], GameController);
//# sourceMappingURL=game.controller.js.map