import { Repository } from 'typeorm';
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
export declare class GetMissionsUseCase {
    private missionRepository;
    private userMissionRepository;
    private userRepository;
    constructor(missionRepository: Repository<Mission>, userMissionRepository: Repository<UserMission>, userRepository: Repository<User>);
    execute(userId: string, type?: MissionType): Promise<MissionWithProgress[]>;
    getDailyMissions(userId: string): Promise<MissionWithProgress[]>;
    getWeeklyMissions(userId: string): Promise<MissionWithProgress[]>;
    getAchievements(userId: string): Promise<MissionWithProgress[]>;
    private getPeriodStart;
    private getPeriodEnd;
}
