import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class TapRateLimitGuard implements CanActivate {
  private readonly maxTapsPerSecond: number;

  constructor(
    private redisService: RedisService,
    private configService: ConfigService,
  ) {
    this.maxTapsPerSecond = this.configService.get<number>(
      'MAX_TAPS_PER_SECOND',
      20,
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;

    if (!userId) {
      return true; // Let auth guard handle this
    }

    const key = `rate_limit:tap:${userId}`;
    const count = await this.redisService.incr(key);

    if (count === 1) {
      await this.redisService.expire(key, 1); // 1 second window
    }

    if (count > this.maxTapsPerSecond) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `Rate limit exceeded. Maximum ${this.maxTapsPerSecond} taps per second.`,
          retryAfter: 1,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}

@Injectable()
export class ApiRateLimitGuard implements CanActivate {
  private readonly maxRequestsPerMinute: number;

  constructor(
    private redisService: RedisService,
    private configService: ConfigService,
  ) {
    this.maxRequestsPerMinute = this.configService.get<number>(
      'RATE_LIMIT_MAX',
      100,
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    const ip = request.ip || request.headers['x-forwarded-for'];

    const identifier = userId || ip;
    if (!identifier) {
      return true;
    }

    const key = `rate_limit:api:${identifier}`;
    const count = await this.redisService.incr(key);

    if (count === 1) {
      await this.redisService.expire(key, 60); // 1 minute window
    }

    if (count > this.maxRequestsPerMinute) {
      const ttl = await this.redisService.ttl(key);
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: ttl,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
