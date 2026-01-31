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
import { RoulettePrize } from '../../domain/entities/roulette-prize.entity';
import { RouletteSpin } from '../../domain/entities/roulette-spin.entity';
import { Collaboration } from '../../domain/entities/collaboration.entity';
import { UserCollaboration } from '../../domain/entities/user-collaboration.entity';
import { Interview } from '../../domain/entities/interview.entity';
import { UserInterview } from '../../domain/entities/user-interview.entity';
import { Podcast } from '../../domain/entities/podcast.entity';
import { UserPodcast } from '../../domain/entities/user-podcast.entity';
import { Raffle } from '../../domain/entities/raffle.entity';
import { RaffleTask } from '../../domain/entities/raffle-task.entity';
import { RaffleTicket } from '../../domain/entities/raffle-ticket.entity';
import { UserRaffleTask } from '../../domain/entities/user-raffle-task.entity';
import { Character } from '../../domain/entities/character.entity';
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
          RoulettePrize,
          RouletteSpin,
          Collaboration,
          UserCollaboration,
          Interview,
          UserInterview,
          Podcast,
          UserPodcast,
          Raffle,
          RaffleTask,
          RaffleTicket,
          UserRaffleTask,
          Character,
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
