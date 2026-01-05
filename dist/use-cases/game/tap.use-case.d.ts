import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { User } from '../../domain/entities/user.entity';
import { EnergyService } from '../../domain/services/energy.service';
import { LevelService } from '../../domain/services/level.service';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { BatchTapDto, TapResponseDto } from '../../presentation/dtos/tap.dto';
export declare class TapUseCase {
    private userRepository;
    private energyService;
    private levelService;
    private redisService;
    private eventEmitter;
    private configService;
    private readonly maxTapsPerSecond;
    private readonly comboTimeoutMs;
    private readonly maxComboMultiplier;
    constructor(userRepository: Repository<User>, energyService: EnergyService, levelService: LevelService, redisService: RedisService, eventEmitter: EventEmitter2, configService: ConfigService);
    execute(userId: string, dto?: BatchTapDto): Promise<TapResponseDto>;
    executeSingle(userId: string): Promise<TapResponseDto>;
}
