import { Repository, DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User } from '../../domain/entities/user.entity';
import { Referral } from '../../domain/entities/referral.entity';
import { RedisService } from '../../infrastructure/redis/redis.service';
export interface ProcessReferralResult {
    success: boolean;
    referrerId: string;
    referredId: string;
    bonusFollowers: string;
}
export declare class ProcessReferralUseCase {
    private userRepository;
    private referralRepository;
    private dataSource;
    private redisService;
    private eventEmitter;
    private readonly signupBonus;
    private readonly referredBonus;
    constructor(userRepository: Repository<User>, referralRepository: Repository<Referral>, dataSource: DataSource, redisService: RedisService, eventEmitter: EventEmitter2);
    execute(referredUserId: string, referralCode: string): Promise<ProcessReferralResult>;
    private findUserByReferralCode;
}
