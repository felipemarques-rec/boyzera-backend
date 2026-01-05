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
exports.TapUseCase = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const config_1 = require("@nestjs/config");
const user_entity_1 = require("../../domain/entities/user.entity");
const energy_service_1 = require("../../domain/services/energy.service");
const level_service_1 = require("../../domain/services/level.service");
const redis_service_1 = require("../../infrastructure/redis/redis.service");
let TapUseCase = class TapUseCase {
    userRepository;
    energyService;
    levelService;
    redisService;
    eventEmitter;
    configService;
    maxTapsPerSecond;
    comboTimeoutMs;
    maxComboMultiplier;
    constructor(userRepository, energyService, levelService, redisService, eventEmitter, configService) {
        this.userRepository = userRepository;
        this.energyService = energyService;
        this.levelService = levelService;
        this.redisService = redisService;
        this.eventEmitter = eventEmitter;
        this.configService = configService;
        this.maxTapsPerSecond = this.configService.get('MAX_TAPS_PER_SECOND', 20);
        this.comboTimeoutMs = this.configService.get('COMBO_TIMEOUT_MS', 1000);
        this.maxComboMultiplier = this.configService.get('COMBO_MAX_MULTIPLIER', 5);
    }
    async execute(userId, dto) {
        const tapCount = dto?.taps || 1;
        if (tapCount < 1 || tapCount > this.maxTapsPerSecond) {
            throw new common_1.BadRequestException(`Invalid tap count. Must be between 1 and ${this.maxTapsPerSecond}`);
        }
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        if (user.isBanned) {
            throw new common_1.BadRequestException('User is banned');
        }
        const energyState = this.energyService.calculateCurrentEnergy(user);
        if (energyState.currentEnergy < tapCount) {
            throw new common_1.BadRequestException(`Not enough energy. Current: ${energyState.currentEnergy}, Required: ${tapCount}`);
        }
        const now = new Date();
        let combo = user.combo || 0;
        const lastTap = user.lastTapAt;
        if (lastTap) {
            const timeSinceLastTap = now.getTime() - lastTap.getTime();
            if (timeSinceLastTap <= this.comboTimeoutMs) {
                combo = Math.min(combo + tapCount, 100);
            }
            else {
                combo = tapCount;
            }
        }
        else {
            combo = tapCount;
        }
        const comboMultiplier = Math.min(1 + (combo / 100) * (this.maxComboMultiplier - 1), this.maxComboMultiplier);
        const baseFollowersPerTap = user.tapMultiplier;
        const followersPerTap = Math.floor(baseFollowersPerTap * comboMultiplier);
        const totalFollowersEarned = BigInt(followersPerTap * tapCount);
        user.followers += totalFollowersEarned;
        user.energy = energyState.currentEnergy - tapCount;
        user.lastEnergyUpdate = now;
        user.totalTaps += BigInt(tapCount);
        user.combo = combo;
        user.lastTapAt = now;
        const levelUpResult = await this.levelService.checkLevelUp(user);
        if (levelUpResult.leveledUp && levelUpResult.rewards) {
            user.level = levelUpResult.newLevel;
            user.maxEnergy = levelUpResult.rewards.maxEnergy;
            user.tapMultiplier = levelUpResult.rewards.tapMultiplier;
            user.gems += levelUpResult.rewards.gems;
            user.followers += levelUpResult.rewards.followers;
        }
        await this.userRepository.save(user);
        this.redisService
            .zadd('leaderboard:global', Number(user.followers), user.id)
            .catch((err) => console.error('Failed to update leaderboard:', err));
        this.eventEmitter.emit('game.tap', {
            userId: user.id,
            tapCount,
            followersEarned: totalFollowersEarned,
            totalFollowers: user.followers,
            combo,
        });
        if (levelUpResult.leveledUp) {
            this.eventEmitter.emit('game.levelUp', {
                userId: user.id,
                previousLevel: levelUpResult.previousLevel,
                newLevel: levelUpResult.newLevel,
                rewards: levelUpResult.rewards,
            });
        }
        const response = {
            success: true,
            tapsProcessed: tapCount,
            followersEarned: totalFollowersEarned.toString(),
            totalFollowers: user.followers.toString(),
            energy: user.energy,
            maxEnergy: user.maxEnergy,
            combo: user.combo,
            comboMultiplier: Math.round(comboMultiplier * 100) / 100,
        };
        if (levelUpResult.leveledUp && levelUpResult.rewards) {
            response.levelUp = {
                previousLevel: levelUpResult.previousLevel,
                newLevel: levelUpResult.newLevel,
                rewards: {
                    gems: levelUpResult.rewards.gems,
                    followers: levelUpResult.rewards.followers.toString(),
                },
            };
        }
        return response;
    }
    async executeSingle(userId) {
        return this.execute(userId, { taps: 1 });
    }
};
exports.TapUseCase = TapUseCase;
exports.TapUseCase = TapUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        energy_service_1.EnergyService,
        level_service_1.LevelService,
        redis_service_1.RedisService,
        event_emitter_1.EventEmitter2,
        config_1.ConfigService])
], TapUseCase);
//# sourceMappingURL=tap.use-case.js.map