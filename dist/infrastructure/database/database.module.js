"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const user_entity_1 = require("../../domain/entities/user.entity");
const upgrade_entity_1 = require("../../domain/entities/upgrade.entity");
const user_upgrade_entity_1 = require("../../domain/entities/user-upgrade.entity");
const level_entity_1 = require("../../domain/entities/level.entity");
const mission_entity_1 = require("../../domain/entities/mission.entity");
const user_mission_entity_1 = require("../../domain/entities/user-mission.entity");
const referral_entity_1 = require("../../domain/entities/referral.entity");
const notification_entity_1 = require("../../domain/entities/notification.entity");
const season_entity_1 = require("../../domain/entities/season.entity");
const transaction_entity_1 = require("../../domain/entities/transaction.entity");
const challenge_entity_1 = require("../../domain/entities/challenge.entity");
const minigame_score_entity_1 = require("../../domain/entities/minigame-score.entity");
const product_entity_1 = require("../../domain/entities/product.entity");
const purchase_entity_1 = require("../../domain/entities/purchase.entity");
const user_booster_entity_1 = require("../../domain/entities/user-booster.entity");
const wallet_connection_entity_1 = require("../../domain/entities/wallet-connection.entity");
const token_distribution_entity_1 = require("../../domain/entities/token-distribution.entity");
const squad_entity_1 = require("../../domain/entities/squad.entity");
const roulette_prize_entity_1 = require("../../domain/entities/roulette-prize.entity");
const roulette_spin_entity_1 = require("../../domain/entities/roulette-spin.entity");
const collaboration_entity_1 = require("../../domain/entities/collaboration.entity");
const user_collaboration_entity_1 = require("../../domain/entities/user-collaboration.entity");
const interview_entity_1 = require("../../domain/entities/interview.entity");
const user_interview_entity_1 = require("../../domain/entities/user-interview.entity");
const podcast_entity_1 = require("../../domain/entities/podcast.entity");
const user_podcast_entity_1 = require("../../domain/entities/user-podcast.entity");
const raffle_entity_1 = require("../../domain/entities/raffle.entity");
const raffle_task_entity_1 = require("../../domain/entities/raffle-task.entity");
const raffle_ticket_entity_1 = require("../../domain/entities/raffle-ticket.entity");
const user_raffle_task_entity_1 = require("../../domain/entities/user-raffle-task.entity");
const character_entity_1 = require("../../domain/entities/character.entity");
const admin_user_entity_1 = require("../../admin/entities/admin-user.entity");
const app_config_entity_1 = require("../../admin/entities/app-config.entity");
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('POSTGRES_HOST'),
                    port: configService.get('POSTGRES_PORT'),
                    username: configService.get('POSTGRES_USER'),
                    password: configService.get('POSTGRES_PASSWORD'),
                    database: configService.get('POSTGRES_DB'),
                    entities: [
                        user_entity_1.User,
                        upgrade_entity_1.Upgrade,
                        user_upgrade_entity_1.UserUpgrade,
                        level_entity_1.Level,
                        mission_entity_1.Mission,
                        user_mission_entity_1.UserMission,
                        referral_entity_1.Referral,
                        notification_entity_1.Notification,
                        season_entity_1.Season,
                        transaction_entity_1.Transaction,
                        challenge_entity_1.Challenge,
                        minigame_score_entity_1.MinigameScore,
                        product_entity_1.Product,
                        purchase_entity_1.Purchase,
                        user_booster_entity_1.UserBooster,
                        wallet_connection_entity_1.WalletConnection,
                        token_distribution_entity_1.TokenDistribution,
                        squad_entity_1.Squad,
                        squad_entity_1.SquadMember,
                        roulette_prize_entity_1.RoulettePrize,
                        roulette_spin_entity_1.RouletteSpin,
                        collaboration_entity_1.Collaboration,
                        user_collaboration_entity_1.UserCollaboration,
                        interview_entity_1.Interview,
                        user_interview_entity_1.UserInterview,
                        podcast_entity_1.Podcast,
                        user_podcast_entity_1.UserPodcast,
                        raffle_entity_1.Raffle,
                        raffle_task_entity_1.RaffleTask,
                        raffle_ticket_entity_1.RaffleTicket,
                        user_raffle_task_entity_1.UserRaffleTask,
                        character_entity_1.Character,
                        admin_user_entity_1.AdminUser,
                        app_config_entity_1.AppConfig,
                    ],
                    synchronize: ['development', 'test'].includes(configService.get('NODE_ENV', 'development')),
                    logging: configService.get('NODE_ENV') === 'development',
                }),
            }),
        ],
    })
], DatabaseModule);
//# sourceMappingURL=database.module.js.map