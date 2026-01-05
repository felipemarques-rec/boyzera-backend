import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Challenge, ChallengeType, ChallengeConfig } from '../../domain/entities/challenge.entity';
import { User } from '../../domain/entities/user.entity';
export interface CreateChallengeParams {
    challengerId: string;
    opponentId: string;
    type: ChallengeType;
    betAmount: bigint;
    config?: ChallengeConfig;
    expiresInMinutes?: number;
}
export declare class CreateChallengeUseCase {
    private challengeRepository;
    private userRepository;
    private eventEmitter;
    private readonly DEFAULT_EXPIRATION_MINUTES;
    private readonly DEFAULT_CONFIGS;
    constructor(challengeRepository: Repository<Challenge>, userRepository: Repository<User>, eventEmitter: EventEmitter2);
    execute(params: CreateChallengeParams): Promise<Challenge>;
    getPendingChallenges(userId: string): Promise<Challenge[]>;
    getActiveChallenges(userId: string): Promise<Challenge[]>;
}
