import { Repository } from 'typeorm';
import { Mission, MissionType, MissionRequirement, MissionReward } from '../../domain/entities/mission.entity';
interface CreateMissionDto {
    type: MissionType;
    title: string;
    description: string;
    requirement: MissionRequirement;
    reward: MissionReward;
    iconName?: string;
    imageUrl?: string;
    sortOrder?: number;
    isActive?: boolean;
    requiredLevel?: number;
}
interface UpdateMissionDto extends Partial<CreateMissionDto> {
}
export declare class AdminMissionsController {
    private missionRepository;
    constructor(missionRepository: Repository<Mission>);
    getMissions(type?: MissionType, isActive?: string): Promise<{
        data: Mission[];
        total: number;
    }>;
    getStats(): Promise<{
        total: number;
        active: number;
        inactive: number;
        byType: {
            daily: number;
            weekly: number;
            achievement: number;
        };
    }>;
    getMission(id: string): Promise<Mission | {
        error: string;
    }>;
    createMission(dto: CreateMissionDto): Promise<{
        success: boolean;
        message: string;
        data: Mission;
    }>;
    updateMission(id: string, dto: UpdateMissionDto): Promise<{
        error: string;
        success?: undefined;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        error?: undefined;
    }>;
    deleteMission(id: string): Promise<{
        error: string;
        success?: undefined;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        error?: undefined;
    }>;
    toggleMission(id: string): Promise<{
        error: string;
        success?: undefined;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        error?: undefined;
    }>;
}
export {};
