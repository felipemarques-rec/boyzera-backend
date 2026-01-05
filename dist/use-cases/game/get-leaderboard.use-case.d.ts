import { Repository } from 'typeorm';
import { User } from '../../domain/entities/user.entity';
import { RedisService } from '../../infrastructure/redis/redis.service';
export interface LeaderboardEntry {
    rank: number;
    userId: string;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    nickname: string | null;
    avatarUrl: string | null;
    followers: string;
    level: number;
}
export declare class GetLeaderboardUseCase {
    private userRepository;
    private redisService;
    constructor(userRepository: Repository<User>, redisService: RedisService);
    execute(type?: string, limit?: number): Promise<LeaderboardEntry[]>;
    getFromDatabase(limit?: number): Promise<LeaderboardEntry[]>;
    getUserRank(userId: string): Promise<number | null>;
    updateUserScore(userId: string, followers: bigint): Promise<void>;
    rebuildLeaderboard(): Promise<void>;
}
