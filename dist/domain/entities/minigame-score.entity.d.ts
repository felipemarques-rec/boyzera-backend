import { User } from './user.entity';
export declare enum MinigameType {
    QUIZ = "quiz",
    MEMORY = "memory",
    SPEED_TAP = "speed_tap",
    WORD_SCRAMBLE = "word_scramble",
    PATTERN_MATCH = "pattern_match"
}
export declare enum MinigameDifficulty {
    EASY = "easy",
    MEDIUM = "medium",
    HARD = "hard"
}
export interface MinigameMetadata {
    correctAnswers?: number;
    totalQuestions?: number;
    timeSpent?: number;
    perfectRounds?: number;
    hintsUsed?: number;
    streakBonus?: number;
}
export declare class MinigameScore {
    id: string;
    userId: string;
    user: User;
    gameType: MinigameType;
    difficulty: MinigameDifficulty;
    score: number;
    highScore: number;
    followersEarned: bigint;
    gemsEarned: number;
    durationSeconds: number;
    metadata: MinigameMetadata;
    createdAt: Date;
    isHighScore(): boolean;
    getScorePerSecond(): number;
}
