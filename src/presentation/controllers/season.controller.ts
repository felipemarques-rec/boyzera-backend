import {
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetCurrentSeasonUseCase } from '../../use-cases/season/get-current-season.use-case';
import { CalculateSeasonRewardsUseCase } from '../../use-cases/season/calculate-season-rewards.use-case';

@Controller('seasons')
@UseGuards(AuthGuard('jwt'))
export class SeasonController {
  constructor(
    private getCurrentSeasonUseCase: GetCurrentSeasonUseCase,
    private calculateSeasonRewardsUseCase: CalculateSeasonRewardsUseCase,
  ) {}

  @Get('current')
  async getCurrentSeason() {
    const result = await this.getCurrentSeasonUseCase.execute();

    if (!result) {
      return {
        success: true,
        data: null,
        message: 'No active or upcoming season',
      };
    }

    return {
      success: true,
      data: {
        id: result.season.id,
        name: result.season.name,
        description: result.season.description,
        status: result.season.status,
        seasonNumber: result.season.seasonNumber,
        startDate: result.season.startDate,
        endDate: result.season.endDate,
        bannerUrl: result.season.bannerUrl,
        themeColor: result.season.themeColor,
        prizePool: result.season.prizePool,
        daysRemaining: result.daysRemaining,
        progressPercentage: result.progressPercentage,
        isActive: result.isActive,
      },
    };
  }

  @Get()
  async getAllSeasons() {
    const seasons = await this.getCurrentSeasonUseCase.getAllSeasons();

    return {
      success: true,
      data: seasons.map((season) => ({
        id: season.id,
        name: season.name,
        status: season.status,
        seasonNumber: season.seasonNumber,
        startDate: season.startDate,
        endDate: season.endDate,
        isActive: season.isActive(),
        rewardsDistributed: season.rewardsDistributed,
      })),
    };
  }

  @Get('history')
  async getSeasonHistory() {
    const seasons = await this.getCurrentSeasonUseCase.getSeasonHistory();

    return {
      success: true,
      data: seasons.map((season) => ({
        id: season.id,
        name: season.name,
        seasonNumber: season.seasonNumber,
        startDate: season.startDate,
        endDate: season.endDate,
        prizePool: season.prizePool,
        rewardsDistributed: season.rewardsDistributed,
        rewardsDistributedAt: season.rewardsDistributedAt,
      })),
    };
  }

  @Get(':id')
  async getSeasonById(@Param('id') id: string) {
    const season = await this.getCurrentSeasonUseCase.getSeasonById(id);

    if (!season) {
      return {
        success: false,
        message: 'Season not found',
      };
    }

    return {
      success: true,
      data: {
        id: season.id,
        name: season.name,
        description: season.description,
        status: season.status,
        seasonNumber: season.seasonNumber,
        startDate: season.startDate,
        endDate: season.endDate,
        bannerUrl: season.bannerUrl,
        themeColor: season.themeColor,
        prizePool: season.prizePool,
        daysRemaining: season.getDaysRemaining(),
        progressPercentage: season.getProgressPercentage(),
        isActive: season.isActive(),
        rewardsDistributed: season.rewardsDistributed,
        rewardsDistributedAt: season.rewardsDistributedAt,
      },
    };
  }

  @Get(':id/stats')
  async getSeasonStats(@Param('id') id: string) {
    const stats = await this.calculateSeasonRewardsUseCase.getSeasonStats(id);

    return {
      success: true,
      data: {
        totalParticipants: stats.totalParticipants,
        topPlayer: stats.topPlayer
          ? {
              userId: stats.topPlayer.userId,
              username: stats.topPlayer.username,
              followers: stats.topPlayer.followers.toString(),
              rank: stats.topPlayer.rank,
            }
          : null,
        averageFollowers: stats.averageFollowers.toString(),
      },
    };
  }

  @Get(':id/my-rank')
  async getMySeasonRank(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.id;
    const rank = await this.calculateSeasonRewardsUseCase.getUserSeasonRank(
      userId,
      id,
    );

    return {
      success: true,
      data: {
        seasonId: id,
        userId,
        rank,
      },
    };
  }

  @Get(':id/rewards/preview')
  async previewSeasonRewards(@Param('id') id: string) {
    try {
      const result = await this.calculateSeasonRewardsUseCase.execute(id);

      return {
        success: true,
        data: {
          seasonId: result.seasonId,
          seasonName: result.seasonName,
          totalParticipants: result.totalParticipants,
          rewards: result.rewards.slice(0, 100).map((reward) => ({
            userId: reward.userId,
            rank: reward.rank,
            gems: reward.gems,
            followers: reward.followers.toString(),
            tokensBz: reward.tokensBz,
            title: reward.title,
          })),
          previewOnly: true,
        },
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to preview rewards',
      };
    }
  }

  // Admin endpoint - should have additional admin guard in production
  @Post(':id/rewards/distribute')
  async distributeSeasonRewards(@Param('id') id: string) {
    try {
      const result =
        await this.calculateSeasonRewardsUseCase.distributeRewards(id);

      return {
        success: true,
        data: {
          seasonId: result.seasonId,
          seasonName: result.seasonName,
          totalParticipants: result.totalParticipants,
          rewardsDistributed: result.rewards.length,
          distributed: result.distributed,
        },
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to distribute rewards',
      };
    }
  }
}
