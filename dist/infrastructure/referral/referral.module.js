"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReferralModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("../../domain/entities/user.entity");
const referral_entity_1 = require("../../domain/entities/referral.entity");
const get_referral_link_use_case_1 = require("../../use-cases/referral/get-referral-link.use-case");
const process_referral_use_case_1 = require("../../use-cases/referral/process-referral.use-case");
const get_referral_stats_use_case_1 = require("../../use-cases/referral/get-referral-stats.use-case");
const referral_controller_1 = require("../../presentation/controllers/referral.controller");
let ReferralModule = class ReferralModule {
};
exports.ReferralModule = ReferralModule;
exports.ReferralModule = ReferralModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, referral_entity_1.Referral])],
        providers: [
            get_referral_link_use_case_1.GetReferralLinkUseCase,
            process_referral_use_case_1.ProcessReferralUseCase,
            get_referral_stats_use_case_1.GetReferralStatsUseCase,
        ],
        controllers: [referral_controller_1.ReferralController],
        exports: [process_referral_use_case_1.ProcessReferralUseCase],
    })
], ReferralModule);
//# sourceMappingURL=referral.module.js.map