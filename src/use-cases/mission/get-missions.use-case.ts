import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Mission, MissionType } from '../../domain/entities/mission.entity';
import { UserMission } from '../../domain/entities/user-mission.entity';
import { User } from '../../domain/entities/user.entity';

export interface MissionWithProgress {
  id: string;
  type: MissionType;
  title: string;
  description: string;
  requirement: Mission['requirement'];
  reward: Mission['reward'];
  iconName: string | null;
  progress: number;
  target: number;
  completed: boolean;
  claimed: boolean;
  completedAt: Date | null;
  periodEnd: Date | null;
}

@Injectable()
export class GetMissionsUseCase {
  constructor(
    @InjectRepository(Mission)
    private missionRepository: Repository<Mission>,
    @InjectRepository(UserMission)
    private userMissionRepository: Repository<UserMission>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async execute(
    userId: string,
    type?: MissionType,
  ): Promise<MissionWithProgress[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    // Get all active missions for user's level
    const whereCondition: any = {
      isActive: true,
      requiredLevel: LessThanOrEqual(user.level),
    };

    if (type) {
      whereCondition.type = type;
    }

    const missions = await this.missionRepository.find({
      where: whereCondition,
      order: { sortOrder: 'ASC' },
    });

    // Get user's mission progress
    const now = new Date();
    const periodStart = this.getPeriodStart(now);

    const userMissions = await this.userMissionRepository.find({
      where: { userId },
    });

    const userMissionMap = new Map<string, UserMission>();
    for (const um of userMissions) {
      // Check if mission is still valid for current period
      if (um.periodEnd && um.periodEnd < now) {
        continue; // Skip expired missions
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

  async getDailyMissions(userId: string): Promise<MissionWithProgress[]> {
    return this.execute(userId, MissionType.DAILY);
  }

  async getWeeklyMissions(userId: string): Promise<MissionWithProgress[]> {
    return this.execute(userId, MissionType.WEEKLY);
  }

  async getAchievements(userId: string): Promise<MissionWithProgress[]> {
    return this.execute(userId, MissionType.ACHIEVEMENT);
  }

  private getPeriodStart(date: Date): Date {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  private getPeriodEnd(type: MissionType, periodStart: Date): Date | null {
    const end = new Date(periodStart);

    switch (type) {
      case MissionType.DAILY:
        end.setDate(end.getDate() + 1);
        return end;
      case MissionType.WEEKLY:
        end.setDate(end.getDate() + 7);
        return end;
      case MissionType.ACHIEVEMENT:
        return null; // No expiration
    }
  }
}
