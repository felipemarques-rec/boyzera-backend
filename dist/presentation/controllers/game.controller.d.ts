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
import { BuyUpgradeDto } from './buy-upgrade.dto';
import { BatchTapDto } from '../dtos/tap.dto';
export declare class GameController {
    private tapUseCase;
    private getUpgradesUseCase;
    private buyUpgradeUseCase;
    private getLeaderboardUseCase;
    private collectPassiveIncomeUseCase;
    private energyService;
    private levelService;
    private passiveIncomeService;
    private userRepository;
    constructor(tapUseCase: TapUseCase, getUpgradesUseCase: GetUpgradesUseCase, buyUpgradeUseCase: BuyUpgradeUseCase, getLeaderboardUseCase: GetLeaderboardUseCase, collectPassiveIncomeUseCase: CollectPassiveIncomeUseCase, energyService: EnergyService, levelService: LevelService, passiveIncomeService: PassiveIncomeService, userRepository: Repository<User>);
    tap(req: any): Promise<import("../dtos/tap.dto").TapResponseDto>;
    tapBatch(req: any, dto: BatchTapDto): Promise<import("../dtos/tap.dto").TapResponseDto>;
    getInitialData(req: any): Promise<{
        user: {
            id: string;
            telegramId: string;
            username: string;
            firstName: string;
            lastName: string;
            nickname: string;
            avatarUrl: string;
            followers: string;
            level: number;
            gems: number;
            tokensBz: number;
            tapMultiplier: number;
            combo: number;
            engagement: number;
            isBanned: boolean;
        };
        energy: {
            current: number;
            max: number;
            regenRate: number;
            secondsUntilFull: number;
        };
        levelProgress: {
            currentLevel: number;
            progress: string;
            required: string;
            percentage: number;
        };
        passiveIncome: {
            hourlyRate: number;
            pendingCollection: string;
            hoursOffline: number;
            maxOfflineHours: number;
        };
        levels: {
            value: number;
            name: string;
            requiredFollowers: string;
            maxEnergy: number;
            tapMultiplier: number;
        }[];
    }>;
    collectOfflineIncome(req: any): Promise<import("../../use-cases/game/collect-passive-income.use-case").CollectIncomeResponse>;
    getUserStats(req: any): Promise<{
        followers: string;
        level: number;
        energy: number;
        maxEnergy: number;
        gems: number;
        tokensBz: number;
        totalTaps: string;
        tapMultiplier: number;
        profitPerHour: number;
        combo: number;
        levelProgress: {
            percentage: number;
            current: string;
            required: string;
        };
    }>;
    getLevels(): Promise<{
        value: number;
        name: string;
        requiredFollowers: string;
        maxEnergy: number;
        energyRegenRate: number;
        tapMultiplier: number;
        rewardGems: number;
        rewardFollowers: string;
        skinUnlock: string;
        description: string;
    }[]>;
    getUpgrades(category?: string): Promise<import("../../domain/entities/upgrade.entity").Upgrade[]>;
    buyUpgrade(req: any, dto: BuyUpgradeDto): Promise<import("../../use-cases/game/buy-upgrade.use-case").BuyUpgradeResult>;
    getLeaderboard(type?: string, limit?: number): Promise<import("../../use-cases/game/get-leaderboard.use-case").LeaderboardEntry[]>;
}
