import { CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';
export declare class AntiCheatGuard implements CanActivate {
    private redisService;
    private configService;
    private readonly isEnabled;
    private readonly maxTapsPerSecond;
    private readonly suspiciousThreshold;
    private readonly banDurationSeconds;
    constructor(redisService: RedisService, configService: ConfigService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    getViolationCount(userId: string): Promise<number>;
    clearViolations(userId: string): Promise<void>;
    unbanUser(userId: string): Promise<void>;
}
