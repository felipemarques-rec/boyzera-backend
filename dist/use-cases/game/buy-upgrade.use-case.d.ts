import { Repository, DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User } from '../../domain/entities/user.entity';
import { Upgrade } from '../../domain/entities/upgrade.entity';
import { UserUpgrade } from '../../domain/entities/user-upgrade.entity';
import { RedisService } from '../../infrastructure/redis/redis.service';
export interface BuyUpgradeResult {
    success: boolean;
    upgrade: Upgrade;
    newLevel: number;
    cost: string;
    effect: number;
    newFollowers: string;
}
export declare class BuyUpgradeUseCase {
    private userRepository;
    private upgradeRepository;
    private userUpgradeRepository;
    private dataSource;
    private redisService;
    private eventEmitter;
    constructor(userRepository: Repository<User>, upgradeRepository: Repository<Upgrade>, userUpgradeRepository: Repository<UserUpgrade>, dataSource: DataSource, redisService: RedisService, eventEmitter: EventEmitter2);
    execute(userId: string, upgradeId: string): Promise<BuyUpgradeResult>;
}
