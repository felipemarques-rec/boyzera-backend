import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ItemModule } from '../item/item.module';
import { User } from '../../domain/entities/user.entity';
import { Upgrade } from '../../domain/entities/upgrade.entity';
import { UserUpgrade } from '../../domain/entities/user-upgrade.entity';
import { Level } from '../../domain/entities/level.entity';
import { HypeConfig } from '../../domain/entities/hype-config.entity';
import { DailyAwardConfig } from '../../domain/entities/daily-award-config.entity';
import { Transaction } from '../../domain/entities/transaction.entity';
import { TapUseCase } from '../../use-cases/game/tap.use-case';
import { GetUpgradesUseCase } from '../../use-cases/game/get-upgrades.use-case';
import { BuyUpgradeUseCase } from '../../use-cases/game/buy-upgrade.use-case';
import { GetLeaderboardUseCase } from '../../use-cases/game/get-leaderboard.use-case';
import { CheckLevelUpUseCase } from '../../use-cases/game/check-level-up.use-case';
import { CollectPassiveIncomeUseCase } from '../../use-cases/game/collect-passive-income.use-case';
import { ProcessDailyHypeUseCase } from '../../use-cases/game/process-daily-hype.use-case';
import { ClaimDailyAwardUseCase } from '../../use-cases/game/claim-daily-award.use-case';
import { EnergyService } from '../../domain/services/energy.service';
import { LevelService } from '../../domain/services/level.service';
import { PassiveIncomeService } from '../../domain/services/passive-income.service';
import { HypeService } from '../../domain/services/hype.service';
import { DailyAwardService } from '../../domain/services/daily-award.service';
import { EngagementTrackerService } from '../../domain/services/engagement-tracker.service';
import { HypeDecayCronService } from '../cron/hype-decay.cron';
import { TapRateLimitGuard, AntiCheatGuard } from '../guards';
import { GameController } from '../../presentation/controllers/game.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Upgrade,
      UserUpgrade,
      Level,
      HypeConfig,
      DailyAwardConfig,
      Transaction,
    ]),
    ScheduleModule.forRoot(),
    ItemModule,
  ],
  providers: [
    // Use Cases
    TapUseCase,
    GetUpgradesUseCase,
    BuyUpgradeUseCase,
    GetLeaderboardUseCase,
    CheckLevelUpUseCase,
    CollectPassiveIncomeUseCase,
    ProcessDailyHypeUseCase,
    ClaimDailyAwardUseCase,
    // Services
    EnergyService,
    LevelService,
    PassiveIncomeService,
    HypeService,
    DailyAwardService,
    EngagementTrackerService,
    // Cron
    HypeDecayCronService,
    // Guards
    TapRateLimitGuard,
    AntiCheatGuard,
  ],
  controllers: [GameController],
  exports: [EnergyService, LevelService, PassiveIncomeService, HypeService],
})
export class GameModule {}
