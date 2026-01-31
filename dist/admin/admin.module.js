"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const admin_user_entity_1 = require("./entities/admin-user.entity");
const app_config_entity_1 = require("./entities/app-config.entity");
const user_entity_1 = require("../domain/entities/user.entity");
const level_entity_1 = require("../domain/entities/level.entity");
const mission_entity_1 = require("../domain/entities/mission.entity");
const upgrade_entity_1 = require("../domain/entities/upgrade.entity");
const referral_entity_1 = require("../domain/entities/referral.entity");
const product_entity_1 = require("../domain/entities/product.entity");
const squad_entity_1 = require("../domain/entities/squad.entity");
const challenge_entity_1 = require("../domain/entities/challenge.entity");
const roulette_prize_entity_1 = require("../domain/entities/roulette-prize.entity");
const roulette_spin_entity_1 = require("../domain/entities/roulette-spin.entity");
const raffle_entity_1 = require("../domain/entities/raffle.entity");
const raffle_task_entity_1 = require("../domain/entities/raffle-task.entity");
const raffle_ticket_entity_1 = require("../domain/entities/raffle-ticket.entity");
const collaboration_entity_1 = require("../domain/entities/collaboration.entity");
const interview_entity_1 = require("../domain/entities/interview.entity");
const podcast_entity_1 = require("../domain/entities/podcast.entity");
const character_entity_1 = require("../domain/entities/character.entity");
const admin_auth_service_1 = require("./services/admin-auth.service");
const admin_auth_guard_1 = require("./guards/admin-auth.guard");
const admin_auth_controller_1 = require("./controllers/admin-auth.controller");
const admin_users_controller_1 = require("./controllers/admin-users.controller");
const admin_levels_controller_1 = require("./controllers/admin-levels.controller");
const admin_missions_controller_1 = require("./controllers/admin-missions.controller");
const admin_upgrades_controller_1 = require("./controllers/admin-upgrades.controller");
const admin_config_controller_1 = require("./controllers/admin-config.controller");
const admin_referrals_controller_1 = require("./controllers/admin-referrals.controller");
const admin_products_controller_1 = require("./controllers/admin-products.controller");
const admin_squads_controller_1 = require("./controllers/admin-squads.controller");
const admin_challenges_controller_1 = require("./controllers/admin-challenges.controller");
const admin_roulette_controller_1 = require("./controllers/admin-roulette.controller");
const admin_raffles_controller_1 = require("./controllers/admin-raffles.controller");
const admin_social_controller_1 = require("./controllers/admin-social.controller");
const admin_characters_controller_1 = require("./controllers/admin-characters.controller");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                admin_user_entity_1.AdminUser,
                app_config_entity_1.AppConfig,
                user_entity_1.User,
                level_entity_1.Level,
                mission_entity_1.Mission,
                upgrade_entity_1.Upgrade,
                referral_entity_1.Referral,
                product_entity_1.Product,
                squad_entity_1.Squad,
                squad_entity_1.SquadMember,
                challenge_entity_1.Challenge,
                roulette_prize_entity_1.RoulettePrize,
                roulette_spin_entity_1.RouletteSpin,
                raffle_entity_1.Raffle,
                raffle_task_entity_1.RaffleTask,
                raffle_ticket_entity_1.RaffleTicket,
                collaboration_entity_1.Collaboration,
                interview_entity_1.Interview,
                podcast_entity_1.Podcast,
                character_entity_1.Character,
            ]),
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    secret: configService.get('JWT_SECRET', 'admin-secret-key'),
                    signOptions: {
                        expiresIn: '8h',
                    },
                }),
            }),
        ],
        controllers: [
            admin_auth_controller_1.AdminAuthController,
            admin_users_controller_1.AdminUsersController,
            admin_levels_controller_1.AdminLevelsController,
            admin_missions_controller_1.AdminMissionsController,
            admin_upgrades_controller_1.AdminUpgradesController,
            admin_config_controller_1.AdminConfigController,
            admin_referrals_controller_1.AdminReferralsController,
            admin_products_controller_1.AdminProductsController,
            admin_squads_controller_1.AdminSquadsController,
            admin_challenges_controller_1.AdminChallengesController,
            admin_roulette_controller_1.AdminRouletteController,
            admin_raffles_controller_1.AdminRafflesController,
            admin_social_controller_1.AdminSocialController,
            admin_characters_controller_1.AdminCharactersController,
        ],
        providers: [admin_auth_service_1.AdminAuthService, admin_auth_guard_1.AdminAuthGuard],
        exports: [admin_auth_service_1.AdminAuthService, admin_auth_guard_1.AdminAuthGuard],
    })
], AdminModule);
//# sourceMappingURL=admin.module.js.map