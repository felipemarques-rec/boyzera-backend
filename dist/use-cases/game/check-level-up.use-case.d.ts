import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User } from '../../domain/entities/user.entity';
import { LevelService, LevelUpResult } from '../../domain/services/level.service';
export declare class CheckLevelUpUseCase {
    private userRepository;
    private levelService;
    private eventEmitter;
    constructor(userRepository: Repository<User>, levelService: LevelService, eventEmitter: EventEmitter2);
    execute(userId: string): Promise<LevelUpResult>;
}
