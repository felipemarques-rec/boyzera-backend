import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../domain/entities/user.entity';
import { Upgrade } from '../../domain/entities/upgrade.entity';
import { UserUpgrade } from '../../domain/entities/user-upgrade.entity';
import { Level } from '../../domain/entities/level.entity';
import { TapUseCase } from '../../use-cases/game/tap.use-case';
import { GetUpgradesUseCase } from '../../use-cases/game/get-upgrades.use-case';
import { BuyUpgradeUseCase } from '../../use-cases/game/buy-upgrade.use-case';
import { GetLeaderboardUseCase } from '../../use-cases/game/get-leaderboard.use-case';
import { CheckLevelUpUseCase } from '../../use-cases/game/check-level-up.use-case';
import { CollectPassiveIncomeUseCase } from '../../use-cases/game/collect-passive-income.use-case';
import { EnergyService } from '../../domain/services/energy.service';
import { LevelService } from '../../domain/services/level.service';
import { PassiveIncomeService } from '../../domain/services/passive-income.service';
import { TapRateLimitGuard, AntiCheatGuard } from '../guards';
import { GameController } from '../../presentation/controllers/game.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Upgrade, UserUpgrade, Level])],
  providers: [
    // Use Cases
    TapUseCase,
    GetUpgradesUseCase,
    BuyUpgradeUseCase,
    GetLeaderboardUseCase,
    CheckLevelUpUseCase,
    CollectPassiveIncomeUseCase,
    // Services
    EnergyService,
    LevelService,
    PassiveIncomeService,
    // Guards
    TapRateLimitGuard,
    AntiCheatGuard,
  ],
  controllers: [GameController],
  exports: [EnergyService, LevelService, PassiveIncomeService],
})
export class GameModule {}
