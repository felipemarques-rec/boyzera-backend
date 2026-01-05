import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';

interface SuspiciousActivityLog {
  timestamp: number;
  type: string;
  details: string;
}

@Injectable()
export class AntiCheatGuard implements CanActivate {
  private readonly isEnabled: boolean;
  private readonly maxTapsPerSecond: number;
  private readonly suspiciousThreshold: number;
  private readonly banDurationSeconds: number;

  constructor(
    private redisService: RedisService,
    private configService: ConfigService,
  ) {
    this.isEnabled = this.configService.get<boolean>(
      'ANTI_CHEAT_ENABLED',
      true,
    );
    this.maxTapsPerSecond = this.configService.get<number>(
      'MAX_TAPS_PER_SECOND',
      20,
    );
    this.suspiciousThreshold = 5; // Number of violations before temp ban
    this.banDurationSeconds = 300; // 5 minute temp ban
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!this.isEnabled) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;

    if (!userId) {
      return true;
    }

    // Check if user is temp banned
    const banKey = `anticheat:banned:${userId}`;
    const isBanned = await this.redisService.exists(banKey);

    if (isBanned) {
      const ttl = await this.redisService.ttl(banKey);
      throw new HttpException(
        {
          statusCode: HttpStatus.FORBIDDEN,
          message: 'Suspicious activity detected. Temporarily banned.',
          retryAfter: ttl,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    // Analyze request for suspicious patterns
    const suspiciousReasons: string[] = [];

    // Check for unusual tap patterns
    const body = request.body;
    if (body?.taps) {
      const taps = body.taps;
      if (taps > this.maxTapsPerSecond) {
        suspiciousReasons.push(`Excessive taps: ${taps}`);
      }
    }

    // Check for automated requests (missing or suspicious headers)
    const userAgent = request.headers['user-agent'];
    if (!userAgent || userAgent.includes('bot') || userAgent.includes('curl')) {
      suspiciousReasons.push(`Suspicious user-agent: ${userAgent}`);
    }

    // Check for request timing anomalies
    const timestamp = body?.timestamp;
    if (timestamp) {
      const serverTime = Date.now();
      const timeDiff = Math.abs(serverTime - timestamp);
      if (timeDiff > 30000) {
        // More than 30 seconds difference
        suspiciousReasons.push(`Time sync issue: ${timeDiff}ms difference`);
      }
    }

    // Log suspicious activity
    if (suspiciousReasons.length > 0) {
      const violationKey = `anticheat:violations:${userId}`;
      const violations = await this.redisService.incr(violationKey);

      if (violations === 1) {
        await this.redisService.expire(violationKey, 3600); // Reset after 1 hour
      }

      // Log the suspicious activity
      const logKey = `anticheat:log:${userId}`;
      const logEntry: SuspiciousActivityLog = {
        timestamp: Date.now(),
        type: 'suspicious_request',
        details: suspiciousReasons.join('; '),
      };
      await this.redisService.set(
        `${logKey}:${Date.now()}`,
        JSON.stringify(logEntry),
        3600,
      );

      // Check if threshold exceeded
      if (violations >= this.suspiciousThreshold) {
        await this.redisService.set(banKey, 'banned', this.banDurationSeconds);
        await this.redisService.del(violationKey);

        throw new HttpException(
          {
            statusCode: HttpStatus.FORBIDDEN,
            message: 'Suspicious activity detected. Temporarily banned.',
            retryAfter: this.banDurationSeconds,
          },
          HttpStatus.FORBIDDEN,
        );
      }
    }

    return true;
  }

  async getViolationCount(userId: string): Promise<number> {
    const count = await this.redisService.get(`anticheat:violations:${userId}`);
    return count ? parseInt(count, 10) : 0;
  }

  async clearViolations(userId: string): Promise<void> {
    await this.redisService.del(`anticheat:violations:${userId}`);
  }

  async unbanUser(userId: string): Promise<void> {
    await this.redisService.del(`anticheat:banned:${userId}`);
  }
}
