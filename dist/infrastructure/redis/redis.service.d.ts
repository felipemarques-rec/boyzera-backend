import { OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
export declare class RedisService implements OnModuleDestroy {
    private configService;
    private readonly client;
    constructor(configService: ConfigService);
    onModuleDestroy(): Promise<void>;
    getClient(): Redis;
    get(key: string): Promise<string | null>;
    set(key: string, value: string, ttlSeconds?: number): Promise<void>;
    del(key: string): Promise<void>;
    incr(key: string): Promise<number>;
    incrby(key: string, increment: number): Promise<number>;
    decr(key: string): Promise<number>;
    decrby(key: string, decrement: number): Promise<number>;
    expire(key: string, seconds: number): Promise<void>;
    ttl(key: string): Promise<number>;
    exists(key: string): Promise<boolean>;
    zadd(key: string, score: number, member: string): Promise<void>;
    zincrby(key: string, increment: number, member: string): Promise<string>;
    zrevrange(key: string, start: number, stop: number): Promise<string[]>;
    zrevrangeWithScores(key: string, start: number, stop: number): Promise<{
        member: string;
        score: number;
    }[]>;
    zrank(key: string, member: string): Promise<number | null>;
    zrevrank(key: string, member: string): Promise<number | null>;
    zscore(key: string, member: string): Promise<string | null>;
    zcard(key: string): Promise<number>;
    hset(key: string, field: string, value: string): Promise<void>;
    hget(key: string, field: string): Promise<string | null>;
    hmset(key: string, data: Record<string, string>): Promise<void>;
    hgetall(key: string): Promise<Record<string, string>>;
    hdel(key: string, field: string): Promise<void>;
    pipeline(): import("ioredis").ChainableCommander;
    multi(): import("ioredis").ChainableCommander;
    getLeaderboard(key: string, start: number, stop: number): Promise<{
        member: string;
        score: number;
    }[]>;
    getRank(key: string, member: string): Promise<number | null>;
}
