"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("../../domain/entities/user.entity");
const upgrade_entity_1 = require("../../domain/entities/upgrade.entity");
const user_upgrade_entity_1 = require("../../domain/entities/user-upgrade.entity");
const level_entity_1 = require("../../domain/entities/level.entity");
const tap_use_case_1 = require("../../use-cases/game/tap.use-case");
const get_upgrades_use_case_1 = require("../../use-cases/game/get-upgrades.use-case");
const buy_upgrade_use_case_1 = require("../../use-cases/game/buy-upgrade.use-case");
const get_leaderboard_use_case_1 = require("../../use-cases/game/get-leaderboard.use-case");
const check_level_up_use_case_1 = require("../../use-cases/game/check-level-up.use-case");
const collect_passive_income_use_case_1 = require("../../use-cases/game/collect-passive-income.use-case");
const energy_service_1 = require("../../domain/services/energy.service");
const level_service_1 = require("../../domain/services/level.service");
const passive_income_service_1 = require("../../domain/services/passive-income.service");
const guards_1 = require("../guards");
const game_controller_1 = require("../../presentation/controllers/game.controller");
let GameModule = class GameModule {
};
exports.GameModule = GameModule;
exports.GameModule = GameModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, upgrade_entity_1.Upgrade, user_upgrade_entity_1.UserUpgrade, level_entity_1.Level])],
        providers: [
            tap_use_case_1.TapUseCase,
            get_upgrades_use_case_1.GetUpgradesUseCase,
            buy_upgrade_use_case_1.BuyUpgradeUseCase,
            get_leaderboard_use_case_1.GetLeaderboardUseCase,
            check_level_up_use_case_1.CheckLevelUpUseCase,
            collect_passive_income_use_case_1.CollectPassiveIncomeUseCase,
            energy_service_1.EnergyService,
            level_service_1.LevelService,
            passive_income_service_1.PassiveIncomeService,
            guards_1.TapRateLimitGuard,
            guards_1.AntiCheatGuard,
        ],
        controllers: [game_controller_1.GameController],
        exports: [energy_service_1.EnergyService, level_service_1.LevelService, passive_income_service_1.PassiveIncomeService],
    })
], GameModule);
//# sourceMappingURL=game.module.js.map