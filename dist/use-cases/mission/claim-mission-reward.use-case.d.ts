import { Repository, DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Mission } from '../../domain/entities/mission.entity';
import { UserMission } from '../../domain/entities/user-mission.entity';
import { User } from '../../domain/entities/user.entity';
import { RedisService } from '../../infrastructure/redis/redis.service';
export interface ClaimRewardResult {
    success: boolean;
    missionId: string;
    missionTitle: string;
    rewards: {
        followers?: string;
        gems?: number;
        energy?: number;
        tokensBz?: number;
    };
    newTotals: {
        followers: string;
        gems: number;
        energy: number;
        tokensBz: number;
    };
}
export declare class ClaimMissionRewardUseCase {
    private missionRepository;
    private userMissionRepository;
    private userRepository;
    private dataSource;
    private redisService;
    private eventEmitter;
    constructor(missionRepository: Repository<Mission>, userMissionRepository: Repository<UserMission>, userRepository: Repository<User>, dataSource: DataSource, redisService: RedisService, eventEmitter: EventEmitter2);
    execute(userId: string, missionId: string): Promise<ClaimRewardResult>;
    claimAllCompleted(userId: string): Promise<ClaimRewardResult[]>;
}
