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
exports.UpdateMissionProgressUseCase = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const mission_entity_1 = require("../../domain/entities/mission.entity");
const user_mission_entity_1 = require("../../domain/entities/user-mission.entity");
let UpdateMissionProgressUseCase = class UpdateMissionProgressUseCase {
    missionRepository;
    userMissionRepository;
    eventEmitter;
    constructor(missionRepository, userMissionRepository, eventEmitter) {
        this.missionRepository = missionRepository;
        this.userMissionRepository = userMissionRepository;
        this.eventEmitter = eventEmitter;
    }
    async execute(userId, requirementType, incrementBy = 1, absoluteValue) {
        const missions = await this.missionRepository
            .createQueryBuilder('mission')
            .where('mission.isActive = :isActive', { isActive: true })
            .andWhere("mission.requirement->>'type' = :type", {
            type: requirementType,
        })
            .getMany();
        if (missions.length === 0) {
            return [];
        }
        const results = [];
        const now = new Date();
        for (const mission of missions) {
            let userMission = await this.getOrCreateUserMission(userId, mission, now);
            if (userMission.completed && userMission.claimed) {
                continue;
            }
            if (userMission.periodEnd && userMission.periodEnd < now) {
                userMission = await this.resetUserMission(userMission, mission, now);
            }
            const previousProgress = userMission.progress;
            const target = mission.requirement.target;
            if (absoluteValue !== undefined) {
                userMission.progress = Math.min(absoluteValue, target);
            }
            else {
                userMission.progress = Math.min(userMission.progress + incrementBy, target);
            }
            const justCompleted = !userMission.completed && userMission.progress >= target;
            if (justCompleted) {
                userMission.completed = true;
                userMission.completedAt = now;
                this.eventEmitter.emit('mission.completed', {
                    userId,
                    missionId: mission.id,
                    missionTitle: mission.title,
                    reward: mission.reward,
                });
            }
            await this.userMissionRepository.save(userMission);
            results.push({
                missionId: mission.id,
                previousProgress,
                newProgress: userMission.progress,
                target,
                completed: userMission.completed,
                justCompleted,
            });
        }
        return results;
    }
    async getOrCreateUserMission(userId, mission, now) {
        const periodStart = this.getPeriodStart(mission.type, now);
        const periodEnd = this.getPeriodEnd(mission.type, periodStart);
        let userMission = await this.userMissionRepository.findOne({
            where: {
                userId,
                missionId: mission.id,
                periodStart,
            },
        });
        if (!userMission) {
            userMission = this.userMissionRepository.create({
                userId,
                missionId: mission.id,
                progress: 0,
                completed: false,
                claimed: false,
                periodStart,
                periodEnd: periodEnd || undefined,
            });
            await this.userMissionRepository.save(userMission);
        }
        return userMission;
    }
    async resetUserMission(userMission, mission, now) {
        const periodStart = this.getPeriodStart(mission.type, now);
        const periodEnd = this.getPeriodEnd(mission.type, periodStart);
        const newUserMission = this.userMissionRepository.create({
            userId: userMission.userId,
            missionId: mission.id,
            progress: 0,
            completed: false,
            claimed: false,
            periodStart,
            periodEnd: periodEnd || undefined,
        });
        await this.userMissionRepository.save(newUserMission);
        return newUserMission;
    }
    getPeriodStart(type, date) {
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        if (type === mission_entity_1.MissionType.WEEKLY) {
            const day = start.getDay();
            const diff = start.getDate() - day + (day === 0 ? -6 : 1);
            start.setDate(diff);
        }
        return start;
    }
    getPeriodEnd(type, periodStart) {
        if (type === mission_entity_1.MissionType.ACHIEVEMENT) {
            return null;
        }
        const end = new Date(periodStart);
        switch (type) {
            case mission_entity_1.MissionType.DAILY:
                end.setDate(end.getDate() + 1);
                break;
            case mission_entity_1.MissionType.WEEKLY:
                end.setDate(end.getDate() + 7);
                break;
        }
        return end;
    }
};
exports.UpdateMissionProgressUseCase = UpdateMissionProgressUseCase;
exports.UpdateMissionProgressUseCase = UpdateMissionProgressUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(mission_entity_1.Mission)),
    __param(1, (0, typeorm_1.InjectRepository)(user_mission_entity_1.UserMission)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        event_emitter_1.EventEmitter2])
], UpdateMissionProgressUseCase);
//# sourceMappingURL=update-mission-progress.use-case.js.map