import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TapUseCase } from '../../use-cases/game/tap.use-case';
import { GetUpgradesUseCase } from '../../use-cases/game/get-upgrades.use-case';
import { BuyUpgradeUseCase } from '../../use-cases/game/buy-upgrade.use-case';
import { GetLeaderboardUseCase } from '../../use-cases/game/get-leaderboard.use-case';
import { CollectPassiveIncomeUseCase } from '../../use-cases/game/collect-passive-income.use-case';
import { EnergyService } from '../../domain/services/energy.service';
import { LevelService } from '../../domain/services/level.service';
import { PassiveIncomeService } from '../../domain/services/passive-income.service';
import { User } from '../../domain/entities/user.entity';
import { TapRateLimitGuard, AntiCheatGuard } from '../../infrastructure/guards';
import { BuyUpgradeDto } from './buy-upgrade.dto';
import { BatchTapDto } from '../dtos/tap.dto';
import { ProcessDailyHypeUseCase } from '../../use-cases/game/process-daily-hype.use-case';
import { ClaimDailyAwardUseCase } from '../../use-cases/game/claim-daily-award.use-case';
import { ItemService } from '../../domain/services/item.service';

@Controller('game')
export class GameController {
  constructor(
    private tapUseCase: TapUseCase,
    private getUpgradesUseCase: GetUpgradesUseCase,
    private buyUpgradeUseCase: BuyUpgradeUseCase,
    private getLeaderboardUseCase: GetLeaderboardUseCase,
    private collectPassiveIncomeUseCase: CollectPassiveIncomeUseCase,
    private processDailyHypeUseCase: ProcessDailyHypeUseCase,
    private claimDailyAwardUseCase: ClaimDailyAwardUseCase,
    private energyService: EnergyService,
    private levelService: LevelService,
    private passiveIncomeService: PassiveIncomeService,
    private itemService: ItemService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  @UseGuards(AuthGuard('jwt'), TapRateLimitGuard, AntiCheatGuard)
  @Post('tap')
  async tap(@Request() req) {
    return this.tapUseCase.execute(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'), TapRateLimitGuard, AntiCheatGuard)
  @Post('tap/batch')
  async tapBatch(
    @Request() req,
    @Body(new ValidationPipe({ transform: true })) dto: BatchTapDto,
  ) {
    return this.tapUseCase.execute(req.user.id, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('initial-data')
  async getInitialData(@Request() req) {
    console.log('=== GET /game/initial-data ===');
    console.log('User ID:', req.user.id);

    const user = await this.userRepository.findOne({
      where: { id: req.user.id },
    });

    if (!user) {
      throw new Error('User not found');
    }

    console.log('User energy from DB:', user.energy);
    console.log('User maxEnergy from DB:', user.maxEnergy);

    // Calculate current energy with regeneration
    const energyState = this.energyService.calculateCurrentEnergy(user);
    console.log('Calculated energyState:', energyState);

    // Get level progress
    const levelProgress = await this.levelService.getProgressToNextLevel(user);

    // Get equipped item bonuses
    let itemBonuses = { totalEngagementBonus: 0, totalFollowersPerHourBonus: 0, equippedItems: [] as any[] };
    try {
      itemBonuses = await this.itemService.getEquippedBonuses(user.id);
    } catch (error) {
      console.error('Error fetching item bonuses:', error);
    }

    // Get passive income info (including equipped item bonuses)
    const passiveIncomeResult =
      this.passiveIncomeService.calculatePassiveIncome(user, itemBonuses.totalFollowersPerHourBonus);

    // Get all levels for progress display
    const levels = await this.levelService.getAllLevels();

    // Claim daily followers award (idempotent by date)
    let dailyAward: any = null;
    try {
      dailyAward = await this.claimDailyAwardUseCase.execute(user.id);
    } catch (error) {
      console.error('Error claiming daily award:', error);
    }

    // Process daily hype if not yet processed today
    let hypeResult: any = null;
    try {
      hypeResult = await this.processDailyHypeUseCase.execute(user.id);
    } catch (error) {
      console.error('Error processing daily hype:', error);
    }

    // Reload user if hype was updated
    const currentUser =
      hypeResult || dailyAward
        ? await this.userRepository.findOne({ where: { id: req.user.id } })
        : user;
    const finalUser = currentUser || user;

    return {
      user: {
        id: finalUser.id,
        telegramId: finalUser.telegramId,
        username: finalUser.username,
        firstName: finalUser.firstName,
        lastName: finalUser.lastName,
        nickname: finalUser.nickname,
        avatarUrl: finalUser.avatarUrl,
        followers: finalUser.followers.toString(),
        level: finalUser.level,
        gems: finalUser.gems,
        tokensBz: finalUser.tokensBz,
        tapMultiplier: finalUser.tapMultiplier,
        combo: finalUser.combo,
        engagement: finalUser.engagement || 0,
        isBanned: finalUser.isBanned,
      },
      energy: {
        current: energyState.currentEnergy,
        max: energyState.maxEnergy,
        regenRate: finalUser.energyRegenRate,
        secondsUntilFull: energyState.secondsUntilFull,
      },
      hype: {
        current: finalUser.hype || 0,
        dailyEngagement: finalUser.dailyEngagement || 0,
        loginStreak: finalUser.loginStreak || 0,
        lastCalculation: finalUser.lastHypeCalculation?.toISOString() || null,
      },
      levelProgress: {
        currentLevel: finalUser.level,
        progress: levelProgress.current.toString(),
        required: levelProgress.required.toString(),
        percentage: levelProgress.percentage,
      },
      passiveIncome: {
        hourlyRate: finalUser.profitPerHour + itemBonuses.totalFollowersPerHourBonus,
        pendingCollection: passiveIncomeResult.earnedFollowers.toString(),
        hoursOffline: passiveIncomeResult.cappedHours,
        maxOfflineHours: this.passiveIncomeService.getMaxOfflineHours(),
      },
      itemBonuses: {
        engagementBonus: itemBonuses.totalEngagementBonus,
        followersPerHourBonus: itemBonuses.totalFollowersPerHourBonus,
        equippedCount: itemBonuses.equippedItems.length,
      },
      dailyAward,
      levels: levels.map((l) => ({
        value: l.value,
        name: l.name,
        requiredFollowers: l.requiredFollowers.toString(),
        maxEnergy: l.maxEnergy,
        tapMultiplier: l.tapMultiplier,
      })),
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('collect-offline')
  async collectOfflineIncome(@Request() req) {
    return this.collectPassiveIncomeUseCase.execute(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('daily-award/claim')
  async claimDailyAward(@Request() req) {
    return this.claimDailyAwardUseCase.execute(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('user/stats')
  async getUserStats(@Request() req) {
    const user = await this.userRepository.findOne({
      where: { id: req.user.id },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const energyState = this.energyService.calculateCurrentEnergy(user);
    const levelProgress = await this.levelService.getProgressToNextLevel(user);

    return {
      followers: user.followers.toString(),
      level: user.level,
      energy: energyState.currentEnergy,
      maxEnergy: energyState.maxEnergy,
      gems: user.gems,
      tokensBz: user.tokensBz,
      totalTaps: user.totalTaps.toString(),
      tapMultiplier: user.tapMultiplier,
      profitPerHour: user.profitPerHour,
      combo: user.combo,
      hype: user.hype || 0,
      levelProgress: {
        percentage: levelProgress.percentage,
        current: levelProgress.current.toString(),
        required: levelProgress.required.toString(),
      },
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('hype/status')
  async getHypeStatus(@Request() req) {
    const user = await this.userRepository.findOne({
      where: { id: req.user.id },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      current: user.hype || 0,
      dailyEngagement: user.dailyEngagement || 0,
      loginStreak: user.loginStreak || 0,
      lastCalculation: user.lastHypeCalculation?.toISOString() || null,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('levels')
  async getLevels() {
    const levels = await this.levelService.getAllLevels();
    return levels.map((l) => ({
      value: l.value,
      name: l.name,
      requiredFollowers: l.requiredFollowers.toString(),
      maxEnergy: l.maxEnergy,
      energyRegenRate: l.energyRegenRate,
      tapMultiplier: l.tapMultiplier,
      rewardGems: l.rewardGems,
      rewardFollowers: l.rewardFollowers.toString(),
      skinUnlock: l.skinUnlock,
      description: l.description,
    }));
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('upgrades')
  async getUpgrades(@Query('category') category?: string) {
    return this.getUpgradesUseCase.execute(category);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('upgrade/buy')
  async buyUpgrade(@Request() req, @Body() dto: BuyUpgradeDto) {
    return this.buyUpgradeUseCase.execute(req.user.id, dto.upgradeId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('leaderboard')
  async getLeaderboard(
    @Query('type') type: string = 'global',
    @Query('limit') limit: number = 100,
  ) {
    return this.getLeaderboardUseCase.execute(type, limit);
  }
}
