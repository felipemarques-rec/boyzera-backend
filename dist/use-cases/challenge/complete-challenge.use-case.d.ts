import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Challenge } from '../../domain/entities/challenge.entity';
import { User } from '../../domain/entities/user.entity';
export interface SubmitScoreParams {
    challengeId: string;
    userId: string;
    score: number;
}
export interface ChallengeScores {
    challengerScore: number | null;
    opponentScore: number | null;
}
export declare class CompleteChallengeUseCase {
    private challengeRepository;
    private userRepository;
    private eventEmitter;
    private readonly challengeScores;
    constructor(challengeRepository: Repository<Challenge>, userRepository: Repository<User>, eventEmitter: EventEmitter2);
    submitScore(params: SubmitScoreParams): Promise<{
        challenge: Challenge;
        isComplete: boolean;
    }>;
    completeChallenge(challenge: Challenge, challengerScore: number, opponentScore: number): Promise<Challenge>;
    private distributeRewards;
    getChallengeHistory(userId: string, limit?: number): Promise<Challenge[]>;
    getChallengeStats(userId: string): Promise<{
        totalChallenges: number;
        wins: number;
        losses: number;
        ties: number;
        winRate: number;
        totalEarned: bigint;
        totalLost: bigint;
    }>;
}
