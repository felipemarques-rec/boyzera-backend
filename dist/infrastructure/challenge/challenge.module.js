"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChallengeModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const challenge_entity_1 = require("../../domain/entities/challenge.entity");
const user_entity_1 = require("../../domain/entities/user.entity");
const create_challenge_use_case_1 = require("../../use-cases/challenge/create-challenge.use-case");
const accept_challenge_use_case_1 = require("../../use-cases/challenge/accept-challenge.use-case");
const complete_challenge_use_case_1 = require("../../use-cases/challenge/complete-challenge.use-case");
const challenge_controller_1 = require("../../presentation/controllers/challenge.controller");
let ChallengeModule = class ChallengeModule {
};
exports.ChallengeModule = ChallengeModule;
exports.ChallengeModule = ChallengeModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([challenge_entity_1.Challenge, user_entity_1.User])],
        controllers: [challenge_controller_1.ChallengeController],
        providers: [
            create_challenge_use_case_1.CreateChallengeUseCase,
            accept_challenge_use_case_1.AcceptChallengeUseCase,
            complete_challenge_use_case_1.CompleteChallengeUseCase,
        ],
        exports: [
            create_challenge_use_case_1.CreateChallengeUseCase,
            accept_challenge_use_case_1.AcceptChallengeUseCase,
            complete_challenge_use_case_1.CompleteChallengeUseCase,
        ],
    })
], ChallengeModule);
//# sourceMappingURL=challenge.module.js.map