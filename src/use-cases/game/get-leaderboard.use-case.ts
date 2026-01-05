import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
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

@Injectable()
export class GetLeaderboardUseCase {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private redisService: RedisService,
  ) {}

  async execute(
    type: string = 'global',
    limit: number = 100,
  ): Promise<LeaderboardEntry[]> {
    const key = `leaderboard:${type}`;

    // Try to get from Redis first
    const redisEntries = await this.redisService.zrevrangeWithScores(
      key,
      0,
      limit - 1,
    );

    if (redisEntries.length > 0) {
      // Get user details for the IDs from Redis
      const userIds = redisEntries.map((e) => e.member);
      const users = await this.userRepository.find({
        where: { id: In(userIds) },
        select: [
          'id',
          'username',
          'firstName',
          'lastName',
          'nickname',
          'avatarUrl',
          'followers',
          'level',
        ],
      });

      const userMap = new Map(users.map((u) => [u.id, u]));

      return redisEntries.map((entry, index) => {
        const user = userMap.get(entry.member);
        return {
          rank: index + 1,
          userId: entry.member,
          username: user?.username || null,
          firstName: user?.firstName || null,
          lastName: user?.lastName || null,
          nickname: user?.nickname || null,
          avatarUrl: user?.avatarUrl || null,
          followers: user?.followers.toString() || entry.score.toString(),
          level: user?.level || 1,
        };
      });
    }

    // Fallback to database if Redis is empty
    return this.getFromDatabase(limit);
  }

  async getFromDatabase(limit: number = 100): Promise<LeaderboardEntry[]> {
    const users = await this.userRepository.find({
      where: { isBanned: false },
      order: { followers: 'DESC' },
      take: limit,
      select: [
        'id',
        'username',
        'firstName',
        'lastName',
        'nickname',
        'avatarUrl',
        'followers',
        'level',
      ],
    });

    // Also populate Redis for next time
    for (const user of users) {
      await this.redisService.zadd(
        'leaderboard:global',
        Number(user.followers),
        user.id,
      );
    }

    return users.map((user, index) => ({
      rank: index + 1,
      userId: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
      followers: user.followers.toString(),
      level: user.level,
    }));
  }

  async getUserRank(userId: string): Promise<number | null> {
    const rank = await this.redisService.zrevrank('leaderboard:global', userId);
    return rank !== null ? rank + 1 : null;
  }

  async updateUserScore(userId: string, followers: bigint): Promise<void> {
    await this.redisService.zadd(
      'leaderboard:global',
      Number(followers),
      userId,
    );
  }

  async rebuildLeaderboard(): Promise<void> {
    // Clear existing
    await this.redisService.del('leaderboard:global');

    // Get all users ordered by followers
    const users = await this.userRepository.find({
      where: { isBanned: false },
      order: { followers: 'DESC' },
      take: 10000, // Limit for performance
    });

    // Batch add to Redis
    const pipeline = this.redisService.pipeline();
    for (const user of users) {
      pipeline.zadd('leaderboard:global', Number(user.followers), user.id);
    }
    await pipeline.exec();
  }
}
