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
exports.ClaimMissionRewardUseCase = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const mission_entity_1 = require("../../domain/entities/mission.entity");
const user_mission_entity_1 = require("../../domain/entities/user-mission.entity");
const user_entity_1 = require("../../domain/entities/user.entity");
const redis_service_1 = require("../../infrastructure/redis/redis.service");
let ClaimMissionRewardUseCase = class ClaimMissionRewardUseCase {
    missionRepository;
    userMissionRepository;
    userRepository;
    dataSource;
    redisService;
    eventEmitter;
    constructor(missionRepository, userMissionRepository, userRepository, dataSource, redisService, eventEmitter) {
        this.missionRepository = missionRepository;
        this.userMissionRepository = userMissionRepository;
        this.userRepository = userRepository;
        this.dataSource = dataSource;
        this.redisService = redisService;
        this.eventEmitter = eventEmitter;
    }
    async execute(userId, missionId) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const mission = await queryRunner.manager.findOne(mission_entity_1.Mission, {
                where: { id: missionId },
            });
            if (!mission) {
                throw new common_1.BadRequestException('Mission not found');
            }
            const userMission = await queryRunner.manager.findOne(user_mission_entity_1.UserMission, {
                where: { userId, missionId },
            });
            if (!userMission) {
                throw new common_1.BadRequestException('Mission not started');
            }
            if (!userMission.completed) {
                throw new common_1.BadRequestException('Mission not completed yet');
            }
            if (userMission.claimed) {
                throw new common_1.BadRequestException('Reward already claimed');
            }
            if (userMission.periodEnd && userMission.periodEnd < new Date()) {
                throw new common_1.BadRequestException('Mission period has expired');
            }
            const user = await queryRunner.manager.findOne(user_entity_1.User, {
                where: { id: userId },
            });
            if (!user) {
                throw new common_1.BadRequestException('User not found');
            }
            const reward = mission.reward;
            const appliedRewards = {};
            if (reward.followers) {
                user.followers += BigInt(reward.followers);
                appliedRewards.followers = reward.followers.toString();
            }
            if (reward.gems) {
                user.gems += reward.gems;
                appliedRewards.gems = reward.gems;
            }
            if (reward.energy) {
                user.energy = Math.min(user.energy + reward.energy, user.maxEnergy);
                appliedRewards.energy = reward.energy;
            }
            if (reward.tokensBz) {
                user.tokensBz += reward.tokensBz;
                appliedRewards.tokensBz = reward.tokensBz;
            }
            userMission.claimed = true;
            userMission.claimedAt = new Date();
            await queryRunner.manager.save(user);
            await queryRunner.manager.save(userMission);
            await queryRunner.commitTransaction();
            await this.redisService.zadd('leaderboard:global', Number(user.followers), user.id);
            this.eventEmitter.emit('mission.rewardClaimed', {
                userId,
                missionId: mission.id,
                missionTitle: mission.title,
                rewards: appliedRewards,
            });
            return {
                success: true,
                missionId: mission.id,
                missionTitle: mission.title,
                rewards: appliedRewards,
                newTotals: {
                    followers: user.followers.toString(),
                    gems: user.gems,
                    energy: user.energy,
                    tokensBz: user.tokensBz,
                },
            };
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
    }
    async claimAllCompleted(userId) {
        const completedMissions = await this.userMissionRepository.find({
            where: {
                userId,
                completed: true,
                claimed: false,
            },
            relations: ['mission'],
        });
        const results = [];
        for (const userMission of completedMissions) {
            if (userMission.periodEnd && userMission.periodEnd < new Date()) {
                continue;
            }
            try {
                const result = await this.execute(userId, userMission.missionId);
                results.push(result);
            }
            catch {
                continue;
            }
        }
        return results;
    }
};
exports.ClaimMissionRewardUseCase = ClaimMissionRewardUseCase;
exports.ClaimMissionRewardUseCase = ClaimMissionRewardUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(mission_entity_1.Mission)),
    __param(1, (0, typeorm_1.InjectRepository)(user_mission_entity_1.UserMission)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(3, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource,
        redis_service_1.RedisService,
        event_emitter_1.EventEmitter2])
], ClaimMissionRewardUseCase);
//# sourceMappingURL=claim-mission-reward.use-case.js.map