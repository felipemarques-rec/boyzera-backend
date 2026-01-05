import { SubmitMinigameScoreUseCase } from '../../use-cases/minigame/submit-minigame-score.use-case';
import { GetMinigameLeaderboardUseCase } from '../../use-cases/minigame/get-minigame-leaderboard.use-case';
import { MinigameType, MinigameDifficulty, MinigameMetadata } from '../../domain/entities/minigame-score.entity';
declare class SubmitScoreDto {
    gameType: MinigameType;
    difficulty: MinigameDifficulty;
    score: number;
    durationSeconds: number;
    metadata?: MinigameMetadata;
}
export declare class MinigameController {
    private submitMinigameScoreUseCase;
    private getMinigameLeaderboardUseCase;
    constructor(submitMinigameScoreUseCase: SubmitMinigameScoreUseCase, getMinigameLeaderboardUseCase: GetMinigameLeaderboardUseCase);
    submitScore(req: any, dto: SubmitScoreDto): Promise<{
        success: boolean;
        data: {
            scoreId: string;
            score: number;
            highScore: number;
            isHighScore: boolean;
            reward: {
                followers: string;
                gems: number;
            };
        };
    }>;
    getLeaderboard(gameType: MinigameType, difficulty?: MinigameDifficulty, limit?: number): Promise<{
        success: boolean;
        data: import("../../use-cases/minigame/get-minigame-leaderboard.use-case").LeaderboardEntry[];
    }>;
    getUserRank(req: any, gameType: MinigameType, difficulty?: MinigameDifficulty): Promise<{
        success: boolean;
        data: {
            rank: number | null;
        };
    }>;
    getUserStats(req: any): Promise<{
        success: boolean;
        data: {
            gameType: MinigameType;
            highScore: number;
            gamesPlayed: number;
            totalFollowersEarned: string;
            totalGemsEarned: number;
            averageScore: number;
            lastPlayedAt: Date | null;
        }[];
    }>;
    getRecentGames(req: any, limit: number): Promise<{
        success: boolean;
        data: {
            id: string;
            gameType: MinigameType;
            difficulty: MinigameDifficulty;
            score: number;
            highScore: number;
            followersEarned: string;
            gemsEarned: number;
            durationSeconds: number;
            createdAt: Date;
        }[];
    }>;
    getGlobalStats(): Promise<{
        success: boolean;
        data: {
            totalGamesPlayed: number;
            totalPlayersParticipated: number;
            mostPopularGame: MinigameType;
            highestScore: {
                gameType: MinigameType;
                score: number;
                userId: string;
            };
        };
    }>;
    getMinigameTypes(): Promise<{
        success: boolean;
        data: {
            types: {
                id: MinigameType;
                name: string;
                description: string;
            }[];
            difficulties: MinigameDifficulty[];
        };
    }>;
    private getMinigameDisplayName;
    private getMinigameDescription;
}
export {};
