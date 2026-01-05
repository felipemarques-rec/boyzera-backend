import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MinigameScore, MinigameType, MinigameDifficulty, MinigameMetadata } from '../../domain/entities/minigame-score.entity';
import { User } from '../../domain/entities/user.entity';
export interface SubmitMinigameScoreParams {
    userId: string;
    gameType: MinigameType;
    difficulty: MinigameDifficulty;
    score: number;
    durationSeconds: number;
    metadata?: MinigameMetadata;
}
export interface MinigameReward {
    followers: bigint;
    gems: number;
    isHighScore: boolean;
}
export declare class SubmitMinigameScoreUseCase {
    private minigameScoreRepository;
    private userRepository;
    private eventEmitter;
    private readonly DIFFICULTY_MULTIPLIERS;
    private readonly BASE_REWARDS;
    constructor(minigameScoreRepository: Repository<MinigameScore>, userRepository: Repository<User>, eventEmitter: EventEmitter2);
    execute(params: SubmitMinigameScoreParams): Promise<{
        score: MinigameScore;
        reward: MinigameReward;
    }>;
    private getHighScore;
    private calculateReward;
}
