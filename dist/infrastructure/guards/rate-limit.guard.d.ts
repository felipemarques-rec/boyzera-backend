import { CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';
export declare class TapRateLimitGuard implements CanActivate {
    private redisService;
    private configService;
    private readonly maxTapsPerSecond;
    constructor(redisService: RedisService, configService: ConfigService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
export declare class ApiRateLimitGuard implements CanActivate {
    private redisService;
    private configService;
    private readonly maxRequestsPerMinute;
    constructor(redisService: RedisService, configService: ConfigService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
