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
exports.LevelService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const level_entity_1 = require("../entities/level.entity");
let LevelService = class LevelService {
    levelRepository;
    constructor(levelRepository) {
        this.levelRepository = levelRepository;
    }
    async getAllLevels() {
        return this.levelRepository.find({
            order: { value: 'ASC' },
        });
    }
    async getLevelByValue(value) {
        return this.levelRepository.findOne({ where: { value } });
    }
    async calculateLevel(followers) {
        const followersStr = followers.toString();
        const level = await this.levelRepository
            .createQueryBuilder('level')
            .where('level.requiredFollowers <= :followers', { followers: followersStr })
            .orderBy('level.value', 'DESC')
            .getOne();
        return level || (await this.getLevelByValue(1));
    }
    async getNextLevel(currentLevel) {
        return this.levelRepository.findOne({
            where: { value: currentLevel + 1 },
        });
    }
    async checkLevelUp(user) {
        const newLevelData = await this.calculateLevel(user.followers);
        if (!newLevelData) {
            return {
                leveledUp: false,
                previousLevel: user.level,
                newLevel: user.level,
                rewards: null,
            };
        }
        if (newLevelData.value > user.level) {
            const rewards = {
                gems: 0,
                followers: BigInt(0),
                maxEnergy: newLevelData.maxEnergy,
                tapMultiplier: newLevelData.tapMultiplier,
                skinUnlock: newLevelData.skinUnlock || undefined,
            };
            const levelsGained = await this.levelRepository.find({
                where: {
                    value: (0, typeorm_2.MoreThan)(user.level),
                },
                order: { value: 'ASC' },
            });
            for (const level of levelsGained) {
                if (level.value <= newLevelData.value) {
                    rewards.gems += level.rewardGems;
                    rewards.followers += level.rewardFollowers;
                }
            }
            return {
                leveledUp: true,
                previousLevel: user.level,
                newLevel: newLevelData.value,
                rewards,
            };
        }
        return {
            leveledUp: false,
            previousLevel: user.level,
            newLevel: user.level,
            rewards: null,
        };
    }
    async getProgressToNextLevel(user) {
        const currentLevel = await this.getLevelByValue(user.level);
        const nextLevel = await this.getNextLevel(user.level);
        if (!nextLevel || !currentLevel) {
            return {
                current: user.followers,
                required: user.followers,
                percentage: 100,
            };
        }
        const currentThreshold = currentLevel.requiredFollowers;
        const nextThreshold = nextLevel.requiredFollowers;
        const progressInLevel = user.followers - currentThreshold;
        const levelRange = nextThreshold - currentThreshold;
        const percentage = levelRange > 0n
            ? Math.min(100, Number((progressInLevel * 100n) / levelRange))
            : 100;
        return {
            current: progressInLevel,
            required: levelRange,
            percentage,
        };
    }
};
exports.LevelService = LevelService;
exports.LevelService = LevelService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(level_entity_1.Level)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], LevelService);
//# sourceMappingURL=level.service.js.map