"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const event_emitter_1 = require("@nestjs/event-emitter");
const throttler_1 = require("@nestjs/throttler");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const database_module_1 = require("./infrastructure/database/database.module");
const auth_module_1 = require("./infrastructure/auth/auth.module");
const game_module_1 = require("./infrastructure/game/game.module");
const redis_module_1 = require("./infrastructure/redis/redis.module");
const mission_module_1 = require("./infrastructure/mission/mission.module");
const referral_module_1 = require("./infrastructure/referral/referral.module");
const notification_module_1 = require("./infrastructure/notification/notification.module");
const season_module_1 = require("./infrastructure/season/season.module");
const transaction_module_1 = require("./infrastructure/transaction/transaction.module");
const challenge_module_1 = require("./infrastructure/challenge/challenge.module");
const minigame_module_1 = require("./infrastructure/minigame/minigame.module");
const shop_module_1 = require("./infrastructure/shop/shop.module");
const blockchain_module_1 = require("./infrastructure/blockchain/blockchain.module");
const squad_module_1 = require("./infrastructure/squad/squad.module");
const admin_module_1 = require("./admin/admin.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            event_emitter_1.EventEmitterModule.forRoot(),
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: 60000,
                    limit: 100,
                },
            ]),
            redis_module_1.RedisModule,
            database_module_1.DatabaseModule,
            auth_module_1.AuthModule,
            game_module_1.GameModule,
            mission_module_1.MissionModule,
            referral_module_1.ReferralModule,
            notification_module_1.NotificationModule,
            season_module_1.SeasonModule,
            transaction_module_1.TransactionModule,
            challenge_module_1.ChallengeModule,
            minigame_module_1.MinigameModule,
            shop_module_1.ShopModule,
            blockchain_module_1.BlockchainModule,
            squad_module_1.SquadModule,
            admin_module_1.AdminModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map