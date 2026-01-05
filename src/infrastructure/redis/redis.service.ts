import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;

  constructor(private configService: ConfigService) {
    this.client = new Redis({
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD'),
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    this.client.on('connect', () => {
      console.log('Redis Client Connected');
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  getClient(): Redis {
    return this.client;
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.set(key, value, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async incrby(key: string, increment: number): Promise<number> {
    return this.client.incrby(key, increment);
  }

  async decr(key: string): Promise<number> {
    return this.client.decr(key);
  }

  async decrby(key: string, decrement: number): Promise<number> {
    return this.client.decrby(key, decrement);
  }

  async expire(key: string, seconds: number): Promise<void> {
    await this.client.expire(key, seconds);
  }

  async ttl(key: string): Promise<number> {
    return this.client.ttl(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  // Sorted Set operations for leaderboards
  async zadd(key: string, score: number, member: string): Promise<void> {
    await this.client.zadd(key, score, member);
  }

  async zincrby(
    key: string,
    increment: number,
    member: string,
  ): Promise<string> {
    return this.client.zincrby(key, increment, member);
  }

  async zrevrange(key: string, start: number, stop: number): Promise<string[]> {
    return this.client.zrevrange(key, start, stop);
  }

  async zrevrangeWithScores(
    key: string,
    start: number,
    stop: number,
  ): Promise<{ member: string; score: number }[]> {
    const result = await this.client.zrevrange(key, start, stop, 'WITHSCORES');
    const entries: { member: string; score: number }[] = [];
    for (let i = 0; i < result.length; i += 2) {
      entries.push({
        member: result[i],
        score: parseFloat(result[i + 1]),
      });
    }
    return entries;
  }

  async zrank(key: string, member: string): Promise<number | null> {
    return this.client.zrank(key, member);
  }

  async zrevrank(key: string, member: string): Promise<number | null> {
    return this.client.zrevrank(key, member);
  }

  async zscore(key: string, member: string): Promise<string | null> {
    return this.client.zscore(key, member);
  }

  async zcard(key: string): Promise<number> {
    return this.client.zcard(key);
  }

  // Hash operations for user data caching
  async hset(key: string, field: string, value: string): Promise<void> {
    await this.client.hset(key, field, value);
  }

  async hget(key: string, field: string): Promise<string | null> {
    return this.client.hget(key, field);
  }

  async hmset(key: string, data: Record<string, string>): Promise<void> {
    await this.client.hmset(key, data);
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    return this.client.hgetall(key);
  }

  async hdel(key: string, field: string): Promise<void> {
    await this.client.hdel(key, field);
  }

  // Pipeline for batch operations
  pipeline() {
    return this.client.pipeline();
  }

  // Multi for transactions
  multi() {
    return this.client.multi();
  }

  // Convenience method for leaderboards
  async getLeaderboard(
    key: string,
    start: number,
    stop: number,
  ): Promise<{ member: string; score: number }[]> {
    return this.zrevrangeWithScores(key, start, stop);
  }

  // Convenience method for getting rank (0-based)
  async getRank(key: string, member: string): Promise<number | null> {
    return this.zrevrank(key, member);
  }
}
