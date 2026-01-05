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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = __importDefault(require("ioredis"));
let RedisService = class RedisService {
    configService;
    client;
    constructor(configService) {
        this.configService = configService;
        this.client = new ioredis_1.default({
            host: this.configService.get('REDIS_HOST', 'localhost'),
            port: this.configService.get('REDIS_PORT', 6379),
            password: this.configService.get('REDIS_PASSWORD'),
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
    getClient() {
        return this.client;
    }
    async get(key) {
        return this.client.get(key);
    }
    async set(key, value, ttlSeconds) {
        if (ttlSeconds) {
            await this.client.set(key, value, 'EX', ttlSeconds);
        }
        else {
            await this.client.set(key, value);
        }
    }
    async del(key) {
        await this.client.del(key);
    }
    async incr(key) {
        return this.client.incr(key);
    }
    async incrby(key, increment) {
        return this.client.incrby(key, increment);
    }
    async decr(key) {
        return this.client.decr(key);
    }
    async decrby(key, decrement) {
        return this.client.decrby(key, decrement);
    }
    async expire(key, seconds) {
        await this.client.expire(key, seconds);
    }
    async ttl(key) {
        return this.client.ttl(key);
    }
    async exists(key) {
        const result = await this.client.exists(key);
        return result === 1;
    }
    async zadd(key, score, member) {
        await this.client.zadd(key, score, member);
    }
    async zincrby(key, increment, member) {
        return this.client.zincrby(key, increment, member);
    }
    async zrevrange(key, start, stop) {
        return this.client.zrevrange(key, start, stop);
    }
    async zrevrangeWithScores(key, start, stop) {
        const result = await this.client.zrevrange(key, start, stop, 'WITHSCORES');
        const entries = [];
        for (let i = 0; i < result.length; i += 2) {
            entries.push({
                member: result[i],
                score: parseFloat(result[i + 1]),
            });
        }
        return entries;
    }
    async zrank(key, member) {
        return this.client.zrank(key, member);
    }
    async zrevrank(key, member) {
        return this.client.zrevrank(key, member);
    }
    async zscore(key, member) {
        return this.client.zscore(key, member);
    }
    async zcard(key) {
        return this.client.zcard(key);
    }
    async hset(key, field, value) {
        await this.client.hset(key, field, value);
    }
    async hget(key, field) {
        return this.client.hget(key, field);
    }
    async hmset(key, data) {
        await this.client.hmset(key, data);
    }
    async hgetall(key) {
        return this.client.hgetall(key);
    }
    async hdel(key, field) {
        await this.client.hdel(key, field);
    }
    pipeline() {
        return this.client.pipeline();
    }
    multi() {
        return this.client.multi();
    }
    async getLeaderboard(key, start, stop) {
        return this.zrevrangeWithScores(key, start, stop);
    }
    async getRank(key, member) {
        return this.zrevrank(key, member);
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RedisService);
//# sourceMappingURL=redis.service.js.map