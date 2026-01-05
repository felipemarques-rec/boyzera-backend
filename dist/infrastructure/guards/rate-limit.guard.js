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
exports.ApiRateLimitGuard = exports.TapRateLimitGuard = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const redis_service_1 = require("../redis/redis.service");
let TapRateLimitGuard = class TapRateLimitGuard {
    redisService;
    configService;
    maxTapsPerSecond;
    constructor(redisService, configService) {
        this.redisService = redisService;
        this.configService = configService;
        this.maxTapsPerSecond = this.configService.get('MAX_TAPS_PER_SECOND', 20);
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const userId = request.user?.id;
        if (!userId) {
            return true;
        }
        const key = `rate_limit:tap:${userId}`;
        const count = await this.redisService.incr(key);
        if (count === 1) {
            await this.redisService.expire(key, 1);
        }
        if (count > this.maxTapsPerSecond) {
            throw new common_1.HttpException({
                statusCode: common_1.HttpStatus.TOO_MANY_REQUESTS,
                message: `Rate limit exceeded. Maximum ${this.maxTapsPerSecond} taps per second.`,
                retryAfter: 1,
            }, common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        return true;
    }
};
exports.TapRateLimitGuard = TapRateLimitGuard;
exports.TapRateLimitGuard = TapRateLimitGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService,
        config_1.ConfigService])
], TapRateLimitGuard);
let ApiRateLimitGuard = class ApiRateLimitGuard {
    redisService;
    configService;
    maxRequestsPerMinute;
    constructor(redisService, configService) {
        this.redisService = redisService;
        this.configService = configService;
        this.maxRequestsPerMinute = this.configService.get('RATE_LIMIT_MAX', 100);
    }
    async canActivate(context) {
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
            await this.redisService.expire(key, 60);
        }
        if (count > this.maxRequestsPerMinute) {
            const ttl = await this.redisService.ttl(key);
            throw new common_1.HttpException({
                statusCode: common_1.HttpStatus.TOO_MANY_REQUESTS,
                message: 'Rate limit exceeded. Please try again later.',
                retryAfter: ttl,
            }, common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        return true;
    }
};
exports.ApiRateLimitGuard = ApiRateLimitGuard;
exports.ApiRateLimitGuard = ApiRateLimitGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService,
        config_1.ConfigService])
], ApiRateLimitGuard);
//# sourceMappingURL=rate-limit.guard.js.map