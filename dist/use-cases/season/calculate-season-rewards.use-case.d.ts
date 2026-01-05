import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Season } from '../../domain/entities/season.entity';
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
export declare class CalculateSeasonRewardsUseCase {
    private seasonRepository;
    private userRepository;
    private redisService;
    private eventEmitter;
    constructor(seasonRepository: Repository<Season>, userRepository: Repository<User>, redisService: RedisService, eventEmitter: EventEmitter2);
    execute(seasonId: string): Promise<SeasonRewardsResult>;
    distributeRewards(seasonId: string): Promise<SeasonRewardsResult>;
    private getSeasonLeaderboard;
    private calculateRewardsForLeaderboard;
    private findTierForRank;
    private applyRewardToUser;
    getUserSeasonRank(userId: string, seasonId?: string): Promise<number | null>;
    getSeasonStats(seasonId: string): Promise<{
        totalParticipants: number;
        topPlayer: LeaderboardEntry | null;
        averageFollowers: bigint;
    }>;
}
