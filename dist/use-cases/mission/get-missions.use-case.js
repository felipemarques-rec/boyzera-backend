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
exports.GetMissionsUseCase = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const mission_entity_1 = require("../../domain/entities/mission.entity");
const user_mission_entity_1 = require("../../domain/entities/user-mission.entity");
const user_entity_1 = require("../../domain/entities/user.entity");
let GetMissionsUseCase = class GetMissionsUseCase {
    missionRepository;
    userMissionRepository;
    userRepository;
    constructor(missionRepository, userMissionRepository, userRepository) {
        this.missionRepository = missionRepository;
        this.userMissionRepository = userMissionRepository;
        this.userRepository = userRepository;
    }
    async execute(userId, type) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new Error('User not found');
        }
        const whereCondition = {
            isActive: true,
            requiredLevel: (0, typeorm_2.LessThanOrEqual)(user.level),
        };
        if (type) {
            whereCondition.type = type;
        }
        const missions = await this.missionRepository.find({
            where: whereCondition,
            order: { sortOrder: 'ASC' },
        });
        const now = new Date();
        const periodStart = this.getPeriodStart(now);
        const userMissions = await this.userMissionRepository.find({
            where: { userId },
        });
        const userMissionMap = new Map();
        for (const um of userMissions) {
            if (um.periodEnd && um.periodEnd < now) {
                continue;
            }
            userMissionMap.set(um.missionId, um);
        }
        return missions.map((mission) => {
            const userMission = userMissionMap.get(mission.id);
            return {
                id: mission.id,
                type: mission.type,
                title: mission.title,
                description: mission.description,
                requirement: mission.requirement,
                reward: mission.reward,
                iconName: mission.iconName,
                progress: userMission?.progress || 0,
                target: mission.requirement.target,
                completed: userMission?.completed || false,
                claimed: userMission?.claimed || false,
                completedAt: userMission?.completedAt || null,
                periodEnd: this.getPeriodEnd(mission.type, periodStart),
            };
        });
    }
    async getDailyMissions(userId) {
        return this.execute(userId, mission_entity_1.MissionType.DAILY);
    }
    async getWeeklyMissions(userId) {
        return this.execute(userId, mission_entity_1.MissionType.WEEKLY);
    }
    async getAchievements(userId) {
        return this.execute(userId, mission_entity_1.MissionType.ACHIEVEMENT);
    }
    getPeriodStart(date) {
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        return start;
    }
    getPeriodEnd(type, periodStart) {
        const end = new Date(periodStart);
        switch (type) {
            case mission_entity_1.MissionType.DAILY:
                end.setDate(end.getDate() + 1);
                return end;
            case mission_entity_1.MissionType.WEEKLY:
                end.setDate(end.getDate() + 7);
                return end;
            case mission_entity_1.MissionType.ACHIEVEMENT:
                return null;
        }
    }
};
exports.GetMissionsUseCase = GetMissionsUseCase;
exports.GetMissionsUseCase = GetMissionsUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(mission_entity_1.Mission)),
    __param(1, (0, typeorm_1.InjectRepository)(user_mission_entity_1.UserMission)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], GetMissionsUseCase);
//# sourceMappingURL=get-missions.use-case.js.map