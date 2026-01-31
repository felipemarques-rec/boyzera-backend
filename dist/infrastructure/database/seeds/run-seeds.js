"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const dotenv_1 = require("dotenv");
const levels_seed_1 = require("./levels.seed");
const level_entity_1 = require("../../../domain/entities/level.entity");
const user_entity_1 = require("../../../domain/entities/user.entity");
const upgrade_entity_1 = require("../../../domain/entities/upgrade.entity");
const user_upgrade_entity_1 = require("../../../domain/entities/user-upgrade.entity");
const mission_entity_1 = require("../../../domain/entities/mission.entity");
const user_mission_entity_1 = require("../../../domain/entities/user-mission.entity");
const referral_entity_1 = require("../../../domain/entities/referral.entity");
const notification_entity_1 = require("../../../domain/entities/notification.entity");
const season_entity_1 = require("../../../domain/entities/season.entity");
const transaction_entity_1 = require("../../../domain/entities/transaction.entity");
const challenge_entity_1 = require("../../../domain/entities/challenge.entity");
const minigame_score_entity_1 = require("../../../domain/entities/minigame-score.entity");
const product_entity_1 = require("../../../domain/entities/product.entity");
const purchase_entity_1 = require("../../../domain/entities/purchase.entity");
const user_booster_entity_1 = require("../../../domain/entities/user-booster.entity");
const wallet_connection_entity_1 = require("../../../domain/entities/wallet-connection.entity");
const token_distribution_entity_1 = require("../../../domain/entities/token-distribution.entity");
const squad_entity_1 = require("../../../domain/entities/squad.entity");
const admin_user_entity_1 = require("../../../admin/entities/admin-user.entity");
const app_config_entity_1 = require("../../../admin/entities/app-config.entity");
(0, dotenv_1.config)();
async function runSeeds() {
    const dataSource = new typeorm_1.DataSource({
        type: 'postgres',
        host: process.env.POSTGRES_HOST || 'localhost',
        port: parseInt(process.env.POSTGRES_PORT || '5434', 10),
        username: process.env.POSTGRES_USER || 'boyzueira',
        password: process.env.POSTGRES_PASSWORD || 'boyzueira',
        database: process.env.POSTGRES_DB || 'boyzueira_db',
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
            admin_user_entity_1.AdminUser,
            app_config_entity_1.AppConfig,
        ],
        synchronize: false,
        logging: true,
    });
    try {
        await dataSource.initialize();
        console.log('Database connected!');
        await (0, levels_seed_1.seedLevels)(dataSource);
        console.log('All seeds completed successfully!');
    }
    catch (error) {
        console.error('Error running seeds:', error);
        process.exit(1);
    }
    finally {
        await dataSource.destroy();
    }
}
runSeeds();
//# sourceMappingURL=run-seeds.js.map