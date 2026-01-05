import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  Mission,
  MissionType,
  MissionRequirementType,
} from '../../domain/entities/mission.entity';
import { UserMission } from '../../domain/entities/user-mission.entity';

export interface UpdateProgressResult {
  missionId: string;
  previousProgress: number;
  newProgress: number;
  target: number;
  completed: boolean;
  justCompleted: boolean;
}

@Injectable()
export class UpdateMissionProgressUseCase {
  constructor(
    @InjectRepository(Mission)
    private missionRepository: Repository<Mission>,
    @InjectRepository(UserMission)
    private userMissionRepository: Repository<UserMission>,
    private eventEmitter: EventEmitter2,
  ) {}

  async execute(
    userId: string,
    requirementType: MissionRequirementType,
    incrementBy: number = 1,
    absoluteValue?: number,
  ): Promise<UpdateProgressResult[]> {
    // Find all missions with this requirement type
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

    const results: UpdateProgressResult[] = [];
    const now = new Date();

    for (const mission of missions) {
      // Get or create user mission
      let userMission = await this.getOrCreateUserMission(userId, mission, now);

      // Skip if already completed and claimed
      if (userMission.completed && userMission.claimed) {
        continue;
      }

      // Skip if period expired for daily/weekly
      if (userMission.periodEnd && userMission.periodEnd < now) {
        // Reset for new period
        userMission = await this.resetUserMission(userMission, mission, now);
      }

      const previousProgress = userMission.progress;
      const target = mission.requirement.target;

      // Update progress
      if (absoluteValue !== undefined) {
        userMission.progress = Math.min(absoluteValue, target);
      } else {
        userMission.progress = Math.min(
          userMission.progress + incrementBy,
          target,
        );
      }

      const justCompleted =
        !userMission.completed && userMission.progress >= target;

      if (justCompleted) {
        userMission.completed = true;
        userMission.completedAt = now;

        // Emit mission completed event
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

  private async getOrCreateUserMission(
    userId: string,
    mission: Mission,
    now: Date,
  ): Promise<UserMission> {
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

  private async resetUserMission(
    userMission: UserMission,
    mission: Mission,
    now: Date,
  ): Promise<UserMission> {
    const periodStart = this.getPeriodStart(mission.type, now);
    const periodEnd = this.getPeriodEnd(mission.type, periodStart);

    // Create new mission for new period
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

  private getPeriodStart(type: MissionType, date: Date): Date {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    if (type === MissionType.WEEKLY) {
      // Start of week (Monday)
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff);
    }

    return start;
  }

  private getPeriodEnd(type: MissionType, periodStart: Date): Date | null {
    if (type === MissionType.ACHIEVEMENT) {
      return null;
    }

    const end = new Date(periodStart);

    switch (type) {
      case MissionType.DAILY:
        end.setDate(end.getDate() + 1);
        break;
      case MissionType.WEEKLY:
        end.setDate(end.getDate() + 7);
        break;
    }

    return end;
  }
}
