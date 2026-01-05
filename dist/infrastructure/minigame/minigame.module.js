"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MinigameModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const minigame_score_entity_1 = require("../../domain/entities/minigame-score.entity");
const user_entity_1 = require("../../domain/entities/user.entity");
const submit_minigame_score_use_case_1 = require("../../use-cases/minigame/submit-minigame-score.use-case");
const get_minigame_leaderboard_use_case_1 = require("../../use-cases/minigame/get-minigame-leaderboard.use-case");
const minigame_controller_1 = require("../../presentation/controllers/minigame.controller");
let MinigameModule = class MinigameModule {
};
exports.MinigameModule = MinigameModule;
exports.MinigameModule = MinigameModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([minigame_score_entity_1.MinigameScore, user_entity_1.User])],
        controllers: [minigame_controller_1.MinigameController],
        providers: [submit_minigame_score_use_case_1.SubmitMinigameScoreUseCase, get_minigame_leaderboard_use_case_1.GetMinigameLeaderboardUseCase],
        exports: [submit_minigame_score_use_case_1.SubmitMinigameScoreUseCase, get_minigame_leaderboard_use_case_1.GetMinigameLeaderboardUseCase],
    })
], MinigameModule);
//# sourceMappingURL=minigame.module.js.map