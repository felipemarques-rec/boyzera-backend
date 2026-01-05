"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MissionModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const mission_entity_1 = require("../../domain/entities/mission.entity");
const user_mission_entity_1 = require("../../domain/entities/user-mission.entity");
const user_entity_1 = require("../../domain/entities/user.entity");
const get_missions_use_case_1 = require("../../use-cases/mission/get-missions.use-case");
const update_mission_progress_use_case_1 = require("../../use-cases/mission/update-mission-progress.use-case");
const claim_mission_reward_use_case_1 = require("../../use-cases/mission/claim-mission-reward.use-case");
const mission_listener_1 = require("../listeners/mission.listener");
const mission_controller_1 = require("../../presentation/controllers/mission.controller");
let MissionModule = class MissionModule {
};
exports.MissionModule = MissionModule;
exports.MissionModule = MissionModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([mission_entity_1.Mission, user_mission_entity_1.UserMission, user_entity_1.User])],
        providers: [
            get_missions_use_case_1.GetMissionsUseCase,
            update_mission_progress_use_case_1.UpdateMissionProgressUseCase,
            claim_mission_reward_use_case_1.ClaimMissionRewardUseCase,
            mission_listener_1.MissionListener,
        ],
        controllers: [mission_controller_1.MissionController],
        exports: [update_mission_progress_use_case_1.UpdateMissionProgressUseCase],
    })
], MissionModule);
//# sourceMappingURL=mission.module.js.map