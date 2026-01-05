import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Challenge } from '../../domain/entities/challenge.entity';
import { User } from '../../domain/entities/user.entity';
export declare class AcceptChallengeUseCase {
    private challengeRepository;
    private userRepository;
    private eventEmitter;
    constructor(challengeRepository: Repository<Challenge>, userRepository: Repository<User>, eventEmitter: EventEmitter2);
    execute(challengeId: string, userId: string): Promise<Challenge>;
    startChallenge(challengeId: string): Promise<Challenge>;
    declineChallenge(challengeId: string, userId: string): Promise<Challenge>;
    cancelChallenge(challengeId: string, userId: string): Promise<Challenge>;
    private refundChallenger;
}
