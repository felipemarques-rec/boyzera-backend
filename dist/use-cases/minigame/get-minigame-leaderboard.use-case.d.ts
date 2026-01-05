import { Repository } from 'typeorm';
import { MinigameScore, MinigameType, MinigameDifficulty } from '../../domain/entities/minigame-score.entity';
import { User } from '../../domain/entities/user.entity';
export interface LeaderboardEntry {
    userId: string;
    username: string;
    highScore: number;
    rank: number;
    gamesPlayed: number;
}
export interface UserMinigameStats {
    gameType: MinigameType;
    highScore: number;
    gamesPlayed: number;
    totalFollowersEarned: bigint;
    totalGemsEarned: number;
    averageScore: number;
    lastPlayedAt: Date | null;
}
export declare class GetMinigameLeaderboardUseCase {
    private minigameScoreRepository;
    private userRepository;
    constructor(minigameScoreRepository: Repository<MinigameScore>, userRepository: Repository<User>);
    execute(gameType: MinigameType, difficulty?: MinigameDifficulty, limit?: number): Promise<LeaderboardEntry[]>;
    getUserRank(userId: string, gameType: MinigameType, difficulty?: MinigameDifficulty): Promise<number | null>;
    getUserStats(userId: string): Promise<UserMinigameStats[]>;
    getRecentGames(userId: string, limit?: number): Promise<MinigameScore[]>;
    getGlobalStats(): Promise<{
        totalGamesPlayed: number;
        totalPlayersParticipated: number;
        mostPopularGame: MinigameType;
        highestScore: {
            gameType: MinigameType;
            score: number;
            userId: string;
        };
    }>;
}
