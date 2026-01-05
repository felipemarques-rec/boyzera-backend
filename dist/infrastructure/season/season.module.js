"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeasonModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const season_entity_1 = require("../../domain/entities/season.entity");
const user_entity_1 = require("../../domain/entities/user.entity");
const transaction_entity_1 = require("../../domain/entities/transaction.entity");
const get_current_season_use_case_1 = require("../../use-cases/season/get-current-season.use-case");
const calculate_season_rewards_use_case_1 = require("../../use-cases/season/calculate-season-rewards.use-case");
const season_controller_1 = require("../../presentation/controllers/season.controller");
const redis_module_1 = require("../redis/redis.module");
let SeasonModule = class SeasonModule {
};
exports.SeasonModule = SeasonModule;
exports.SeasonModule = SeasonModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([season_entity_1.Season, user_entity_1.User, transaction_entity_1.Transaction]), redis_module_1.RedisModule],
        controllers: [season_controller_1.SeasonController],
        providers: [get_current_season_use_case_1.GetCurrentSeasonUseCase, calculate_season_rewards_use_case_1.CalculateSeasonRewardsUseCase],
        exports: [get_current_season_use_case_1.GetCurrentSeasonUseCase, calculate_season_rewards_use_case_1.CalculateSeasonRewardsUseCase],
    })
], SeasonModule);
//# sourceMappingURL=season.module.js.map