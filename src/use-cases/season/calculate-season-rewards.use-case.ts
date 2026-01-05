import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  Season,
  SeasonStatus,
  SeasonRewardTier,
} from '../../domain/entities/season.entity';
import { User } from '../../domain/entities/user.entity';
import { RedisService } from '../../infrastructure/redis/redis.service';

export interface LeaderboardEntry {
  userId: string;
  username: string;
  followers: bigint;
  rank: number;
}

export interface UserSeasonReward {
  userId: string;
  rank: number;
  gems: number;
  followers: bigint;
  tokensBz: number;
  title?: string;
}

export interface SeasonRewardsResult {
  seasonId: string;
  seasonName: string;
  totalParticipants: number;
  rewards: UserSeasonReward[];
  distributed: boolean;
}

@Injectable()
export class CalculateSeasonRewardsUseCase {
  constructor(
    @InjectRepository(Season)
    private seasonRepository: Repository<Season>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private redisService: RedisService,
    private eventEmitter: EventEmitter2,
  ) {}

  async execute(seasonId: string): Promise<SeasonRewardsResult> {
    const season = await this.seasonRepository.findOne({
      where: { id: seasonId },
    });

    if (!season) {
      throw new NotFoundException('Season not found');
    }

    if (season.status !== SeasonStatus.ENDED) {
      throw new BadRequestException('Season has not ended yet');
    }

    if (season.rewardsDistributed) {
      throw new BadRequestException(
        'Rewards already distributed for this season',
      );
    }

    // Get final leaderboard
    const leaderboard = await this.getSeasonLeaderboard(seasonId);

    if (leaderboard.length === 0) {
      return {
        seasonId: season.id,
        seasonName: season.name,
        totalParticipants: 0,
        rewards: [],
        distributed: false,
      };
    }

    // Calculate rewards for each eligible user
    const rewards = this.calculateRewardsForLeaderboard(
      leaderboard,
      season.prizePool.tiers,
    );

    return {
      seasonId: season.id,
      seasonName: season.name,
      totalParticipants: leaderboard.length,
      rewards,
      distributed: false,
    };
  }

  async distributeRewards(seasonId: string): Promise<SeasonRewardsResult> {
    const result = await this.execute(seasonId);

    if (result.rewards.length === 0) {
      return { ...result, distributed: true };
    }

    // Distribute rewards to each user
    for (const reward of result.rewards) {
      await this.applyRewardToUser(reward);

      // Emit event for each reward
      this.eventEmitter.emit('season.reward.distributed', {
        userId: reward.userId,
        seasonId: result.seasonId,
        seasonName: result.seasonName,
        rank: reward.rank,
        gems: reward.gems,
        followers: reward.followers,
        tokensBz: reward.tokensBz,
        title: reward.title,
      });
    }

    // Mark season as rewards distributed
    await this.seasonRepository.update(seasonId, {
      rewardsDistributed: true,
      rewardsDistributedAt: new Date(),
    });

    return { ...result, distributed: true };
  }

  private async getSeasonLeaderboard(
    seasonId: string,
  ): Promise<LeaderboardEntry[]> {
    // Try to get from Redis first
    const redisKey = `season:${seasonId}:leaderboard`;
    const cachedLeaderboard = await this.redisService.getLeaderboard(
      redisKey,
      0,
      999,
    );

    if (cachedLeaderboard.length > 0) {
      const entries: LeaderboardEntry[] = [];
      for (let i = 0; i < cachedLeaderboard.length; i++) {
        const userId = cachedLeaderboard[i].member;
        const user = await this.userRepository.findOne({
          where: { id: userId },
          select: ['id', 'username', 'followers'],
        });

        if (user) {
          entries.push({
            userId: user.id,
            username: user.username || 'Anonymous',
            followers: user.followers,
            rank: i + 1,
          });
        }
      }
      return entries;
    }

    // Fallback to database
    const users = await this.userRepository.find({
      order: { followers: 'DESC' },
      take: 1000,
      select: ['id', 'username', 'followers'],
    });

    return users.map((user, index) => ({
      userId: user.id,
      username: user.username || 'Anonymous',
      followers: user.followers,
      rank: index + 1,
    }));
  }

  private calculateRewardsForLeaderboard(
    leaderboard: LeaderboardEntry[],
    tiers: SeasonRewardTier[],
  ): UserSeasonReward[] {
    const rewards: UserSeasonReward[] = [];

    for (const entry of leaderboard) {
      const tier = this.findTierForRank(entry.rank, tiers);

      if (tier) {
        rewards.push({
          userId: entry.userId,
          rank: entry.rank,
          gems: tier.gems,
          followers: BigInt(tier.followers),
          tokensBz: tier.tokensBz,
          title: tier.title,
        });
      }
    }

    return rewards;
  }

  private findTierForRank(
    rank: number,
    tiers: SeasonRewardTier[],
  ): SeasonRewardTier | null {
    // First, check for exact rank match
    const exactMatch = tiers.find((tier) => tier.rank === rank);
    if (exactMatch) {
      return exactMatch;
    }

    // Then, check for range match
    const rangeMatch = tiers.find(
      (tier) =>
        tier.rank === 0 &&
        tier.minRank !== undefined &&
        tier.maxRank !== undefined &&
        rank >= tier.minRank &&
        rank <= tier.maxRank,
    );

    return rangeMatch || null;
  }

  private async applyRewardToUser(reward: UserSeasonReward): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: reward.userId },
    });

    if (!user) {
      return;
    }

    // Apply rewards
    user.gems += reward.gems;
    user.followers = user.followers + reward.followers;
    user.tokensBz += reward.tokensBz;

    await this.userRepository.save(user);
  }

  async getUserSeasonRank(
    userId: string,
    seasonId?: string,
  ): Promise<number | null> {
    const redisKey = seasonId
      ? `season:${seasonId}:leaderboard`
      : 'leaderboard:global';

    const rank = await this.redisService.getRank(redisKey, userId);
    return rank !== null ? rank + 1 : null; // Convert 0-based to 1-based
  }

  async getSeasonStats(seasonId: string): Promise<{
    totalParticipants: number;
    topPlayer: LeaderboardEntry | null;
    averageFollowers: bigint;
  }> {
    const leaderboard = await this.getSeasonLeaderboard(seasonId);

    if (leaderboard.length === 0) {
      return {
        totalParticipants: 0,
        topPlayer: null,
        averageFollowers: BigInt(0),
      };
    }

    const totalFollowers = leaderboard.reduce(
      (sum, entry) => sum + entry.followers,
      BigInt(0),
    );

    return {
      totalParticipants: leaderboard.length,
      topPlayer: leaderboard[0],
      averageFollowers: totalFollowers / BigInt(leaderboard.length),
    };
  }
}
