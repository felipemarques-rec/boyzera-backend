import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../../domain/entities/user.entity';
import { Upgrade } from '../../domain/entities/upgrade.entity';
import { UserUpgrade } from '../../domain/entities/user-upgrade.entity';
import { Level } from '../../domain/entities/level.entity';
import { Mission } from '../../domain/entities/mission.entity';
import { UserMission } from '../../domain/entities/user-mission.entity';
import { Referral } from '../../domain/entities/referral.entity';
import { Notification } from '../../domain/entities/notification.entity';
import { Season } from '../../domain/entities/season.entity';
import { Transaction } from '../../domain/entities/transaction.entity';
import { Challenge } from '../../domain/entities/challenge.entity';
import { MinigameScore } from '../../domain/entities/minigame-score.entity';
import { Product } from '../../domain/entities/product.entity';
import { Purchase } from '../../domain/entities/purchase.entity';
import { UserBooster } from '../../domain/entities/user-booster.entity';
import { WalletConnection } from '../../domain/entities/wallet-connection.entity';
import { TokenDistribution } from '../../domain/entities/token-distribution.entity';
import { Squad, SquadMember } from '../../domain/entities/squad.entity';
import { AdminUser } from '../../admin/entities/admin-user.entity';
import { AppConfig } from '../../admin/entities/app-config.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('POSTGRES_HOST'),
        port: configService.get<number>('POSTGRES_PORT'),
        username: configService.get<string>('POSTGRES_USER'),
        password: configService.get<string>('POSTGRES_PASSWORD'),
        database: configService.get<string>('POSTGRES_DB'),
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
        synchronize: ['development', 'test'].includes(
          configService.get<string>('NODE_ENV', 'development'),
        ),
        logging: configService.get<string>('NODE_ENV') === 'development',
      }),
    }),
  ],
})
export class DatabaseModule {}
