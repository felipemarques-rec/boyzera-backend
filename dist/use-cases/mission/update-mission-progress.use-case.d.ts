import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Mission, MissionRequirementType } from '../../domain/entities/mission.entity';
import { UserMission } from '../../domain/entities/user-mission.entity';
export interface UpdateProgressResult {
    missionId: string;
    previousProgress: number;
    newProgress: number;
    target: number;
    completed: boolean;
    justCompleted: boolean;
}
export declare class UpdateMissionProgressUseCase {
    private missionRepository;
    private userMissionRepository;
    private eventEmitter;
    constructor(missionRepository: Repository<Mission>, userMissionRepository: Repository<UserMission>, eventEmitter: EventEmitter2);
    execute(userId: string, requirementType: MissionRequirementType, incrementBy?: number, absoluteValue?: number): Promise<UpdateProgressResult[]>;
    private getOrCreateUserMission;
    private resetUserMission;
    private getPeriodStart;
    private getPeriodEnd;
}
