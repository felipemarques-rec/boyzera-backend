import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User } from '../../domain/entities/user.entity';
import { PassiveIncomeService, PassiveIncomeResult } from '../../domain/services/passive-income.service';
import { RedisService } from '../../infrastructure/redis/redis.service';
export interface CollectIncomeResponse extends PassiveIncomeResult {
    newTotalFollowers: bigint;
}
export declare class CollectPassiveIncomeUseCase {
    private userRepository;
    private passiveIncomeService;
    private redisService;
    private eventEmitter;
    constructor(userRepository: Repository<User>, passiveIncomeService: PassiveIncomeService, redisService: RedisService, eventEmitter: EventEmitter2);
    execute(userId: string): Promise<CollectIncomeResponse>;
}
