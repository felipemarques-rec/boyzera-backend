import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './infrastructure/database/database.module';
import { AuthModule } from './infrastructure/auth/auth.module';
import { GameModule } from './infrastructure/game/game.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { MissionModule } from './infrastructure/mission/mission.module';
import { ReferralModule } from './infrastructure/referral/referral.module';
import { NotificationModule } from './infrastructure/notification/notification.module';
import { SeasonModule } from './infrastructure/season/season.module';
import { TransactionModule } from './infrastructure/transaction/transaction.module';
import { ChallengeModule } from './infrastructure/challenge/challenge.module';
import { MinigameModule } from './infrastructure/minigame/minigame.module';
import { ShopModule } from './infrastructure/shop/shop.module';
import { BlockchainModule } from './infrastructure/blockchain/blockchain.module';
import { SquadModule } from './infrastructure/squad/squad.module';
import { RouletteModule } from './infrastructure/roulette/roulette.module';
import { SocialModule } from './infrastructure/social/social.module';
import { RaffleModule } from './infrastructure/raffle/raffle.module';
import { CharacterModule } from './infrastructure/character/character.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    RedisModule,
    DatabaseModule,
    AuthModule,
    GameModule,
    MissionModule,
    ReferralModule,
    NotificationModule,
    SeasonModule,
    TransactionModule,
    ChallengeModule,
    MinigameModule,
    ShopModule,
    BlockchainModule,
    SquadModule,
    RouletteModule,
    SocialModule,
    RaffleModule,
    CharacterModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
