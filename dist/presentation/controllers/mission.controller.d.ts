import { GetMissionsUseCase } from '../../use-cases/mission/get-missions.use-case';
import { ClaimMissionRewardUseCase } from '../../use-cases/mission/claim-mission-reward.use-case';
import { MissionType } from '../../domain/entities/mission.entity';
export declare class MissionController {
    private getMissionsUseCase;
    private claimMissionRewardUseCase;
    constructor(getMissionsUseCase: GetMissionsUseCase, claimMissionRewardUseCase: ClaimMissionRewardUseCase);
    getMissions(req: any, type?: MissionType): Promise<import("../../use-cases/mission/get-missions.use-case").MissionWithProgress[]>;
    getDailyMissions(req: any): Promise<import("../../use-cases/mission/get-missions.use-case").MissionWithProgress[]>;
    getWeeklyMissions(req: any): Promise<import("../../use-cases/mission/get-missions.use-case").MissionWithProgress[]>;
    getAchievements(req: any): Promise<import("../../use-cases/mission/get-missions.use-case").MissionWithProgress[]>;
    claimReward(req: any, missionId: string): Promise<import("../../use-cases/mission/claim-mission-reward.use-case").ClaimRewardResult>;
    claimAllRewards(req: any): Promise<import("../../use-cases/mission/claim-mission-reward.use-case").ClaimRewardResult[]>;
}
