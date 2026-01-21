import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { seedLevels } from './levels.seed';
import { Level } from '../../../domain/entities/level.entity';
import { User } from '../../../domain/entities/user.entity';
import { Upgrade } from '../../../domain/entities/upgrade.entity';
import { UserUpgrade } from '../../../domain/entities/user-upgrade.entity';
import { Mission } from '../../../domain/entities/mission.entity';
import { UserMission } from '../../../domain/entities/user-mission.entity';
import { Referral } from '../../../domain/entities/referral.entity';
import { Notification } from '../../../domain/entities/notification.entity';
import { Season } from '../../../domain/entities/season.entity';
import { Transaction } from '../../../domain/entities/transaction.entity';
import { Challenge } from '../../../domain/entities/challenge.entity';
import { MinigameScore } from '../../../domain/entities/minigame-score.entity';
import { Product } from '../../../domain/entities/product.entity';
import { Purchase } from '../../../domain/entities/purchase.entity';
import { UserBooster } from '../../../domain/entities/user-booster.entity';
import { WalletConnection } from '../../../domain/entities/wallet-connection.entity';
import { TokenDistribution } from '../../../domain/entities/token-distribution.entity';
import { Squad, SquadMember } from '../../../domain/entities/squad.entity';
import { AdminUser } from '../../../admin/entities/admin-user.entity';
import { AppConfig } from '../../../admin/entities/app-config.entity';

config();

async function runSeeds() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5434', 10),
    username: process.env.POSTGRES_USER || 'boyzueira',
    password: process.env.POSTGRES_PASSWORD || 'boyzueira',
    database: process.env.POSTGRES_DB || 'boyzueira_db',
    entities: [
      User,
      Upgrade,
      UserUpgrade,
      Level,
      Mission,
      UserMission,
      Referral,
      Notification,
      Season,
      Transaction,
      Challenge,
      MinigameScore,
      Product,
      Purchase,
      UserBooster,
      WalletConnection,
      TokenDistribution,
      Squad,
      SquadMember,
      AdminUser,
      AppConfig,
    ],
    synchronize: false,
    logging: true,
  });

  try {
    await dataSource.initialize();
    console.log('Database connected!');

    // Run seeds
    await seedLevels(dataSource);

    console.log('All seeds completed successfully!');
  } catch (error) {
    console.error('Error running seeds:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

runSeeds();
