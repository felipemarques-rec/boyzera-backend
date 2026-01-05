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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectPassiveIncomeUseCase = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const user_entity_1 = require("../../domain/entities/user.entity");
const passive_income_service_1 = require("../../domain/services/passive-income.service");
const redis_service_1 = require("../../infrastructure/redis/redis.service");
let CollectPassiveIncomeUseCase = class CollectPassiveIncomeUseCase {
    userRepository;
    passiveIncomeService;
    redisService;
    eventEmitter;
    constructor(userRepository, passiveIncomeService, redisService, eventEmitter) {
        this.userRepository = userRepository;
        this.passiveIncomeService = passiveIncomeService;
        this.redisService = redisService;
        this.eventEmitter = eventEmitter;
    }
    async execute(userId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new Error('User not found');
        }
        const incomeResult = this.passiveIncomeService.calculatePassiveIncome(user);
        if (incomeResult.wasCollected) {
            user.followers += incomeResult.earnedFollowers;
            user.lastLoginAt = new Date();
            await this.userRepository.save(user);
            await this.redisService.zadd('leaderboard:global', Number(user.followers), user.id);
            this.eventEmitter.emit('game.passiveIncome', {
                userId: user.id,
                earnedFollowers: incomeResult.earnedFollowers,
                hoursOffline: incomeResult.cappedHours,
            });
        }
        else {
            user.lastLoginAt = new Date();
            await this.userRepository.save(user);
        }
        return {
            ...incomeResult,
            newTotalFollowers: user.followers,
        };
    }
};
exports.CollectPassiveIncomeUseCase = CollectPassiveIncomeUseCase;
exports.CollectPassiveIncomeUseCase = CollectPassiveIncomeUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        passive_income_service_1.PassiveIncomeService,
        redis_service_1.RedisService,
        event_emitter_1.EventEmitter2])
], CollectPassiveIncomeUseCase);
//# sourceMappingURL=collect-passive-income.use-case.js.map