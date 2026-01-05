"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AntiCheatGuard = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const redis_service_1 = require("../redis/redis.service");
let AntiCheatGuard = class AntiCheatGuard {
    redisService;
    configService;
    isEnabled;
    maxTapsPerSecond;
    suspiciousThreshold;
    banDurationSeconds;
    constructor(redisService, configService) {
        this.redisService = redisService;
        this.configService = configService;
        this.isEnabled = this.configService.get('ANTI_CHEAT_ENABLED', true);
        this.maxTapsPerSecond = this.configService.get('MAX_TAPS_PER_SECOND', 20);
        this.suspiciousThreshold = 5;
        this.banDurationSeconds = 300;
    }
    async canActivate(context) {
        if (!this.isEnabled) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const userId = request.user?.id;
        if (!userId) {
            return true;
        }
        const banKey = `anticheat:banned:${userId}`;
        const isBanned = await this.redisService.exists(banKey);
        if (isBanned) {
            const ttl = await this.redisService.ttl(banKey);
            throw new common_1.HttpException({
                statusCode: common_1.HttpStatus.FORBIDDEN,
                message: 'Suspicious activity detected. Temporarily banned.',
                retryAfter: ttl,
            }, common_1.HttpStatus.FORBIDDEN);
        }
        const suspiciousReasons = [];
        const body = request.body;
        if (body?.taps) {
            const taps = body.taps;
            if (taps > this.maxTapsPerSecond) {
                suspiciousReasons.push(`Excessive taps: ${taps}`);
            }
        }
        const userAgent = request.headers['user-agent'];
        if (!userAgent || userAgent.includes('bot') || userAgent.includes('curl')) {
            suspiciousReasons.push(`Suspicious user-agent: ${userAgent}`);
        }
        const timestamp = body?.timestamp;
        if (timestamp) {
            const serverTime = Date.now();
            const timeDiff = Math.abs(serverTime - timestamp);
            if (timeDiff > 30000) {
                suspiciousReasons.push(`Time sync issue: ${timeDiff}ms difference`);
            }
        }
        if (suspiciousReasons.length > 0) {
            const violationKey = `anticheat:violations:${userId}`;
            const violations = await this.redisService.incr(violationKey);
            if (violations === 1) {
                await this.redisService.expire(violationKey, 3600);
            }
            const logKey = `anticheat:log:${userId}`;
            const logEntry = {
                timestamp: Date.now(),
                type: 'suspicious_request',
                details: suspiciousReasons.join('; '),
            };
            await this.redisService.set(`${logKey}:${Date.now()}`, JSON.stringify(logEntry), 3600);
            if (violations >= this.suspiciousThreshold) {
                await this.redisService.set(banKey, 'banned', this.banDurationSeconds);
                await this.redisService.del(violationKey);
                throw new common_1.HttpException({
                    statusCode: common_1.HttpStatus.FORBIDDEN,
                    message: 'Suspicious activity detected. Temporarily banned.',
                    retryAfter: this.banDurationSeconds,
                }, common_1.HttpStatus.FORBIDDEN);
            }
        }
        return true;
    }
    async getViolationCount(userId) {
        const count = await this.redisService.get(`anticheat:violations:${userId}`);
        return count ? parseInt(count, 10) : 0;
    }
    async clearViolations(userId) {
        await this.redisService.del(`anticheat:violations:${userId}`);
    }
    async unbanUser(userId) {
        await this.redisService.del(`anticheat:banned:${userId}`);
    }
};
exports.AntiCheatGuard = AntiCheatGuard;
exports.AntiCheatGuard = AntiCheatGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService,
        config_1.ConfigService])
], AntiCheatGuard);
//# sourceMappingURL=anti-cheat.guard.js.map