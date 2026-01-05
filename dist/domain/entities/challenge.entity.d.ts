import { User } from './user.entity';
export declare enum ChallengeType {
    X1_TAP = "x1_tap",
    TRUCO = "truco",
    SPEED_TAP = "speed_tap",
    MEMORY = "memory",
    QUIZ = "quiz"
}
export declare enum ChallengeStatus {
    PENDING = "pending",
    ACCEPTED = "accepted",
    ONGOING = "ongoing",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
    EXPIRED = "expired"
}
export interface ChallengeConfig {
    duration?: number;
    rounds?: number;
    maxTaps?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
}
export interface ChallengeResult {
    challengerId: string;
    challengerScore: number;
    opponentId: string;
    opponentScore: number;
    winnerId: string | null;
    completedAt: Date;
}
export declare class Challenge {
    id: string;
    type: ChallengeType;
    status: ChallengeStatus;
    challengerId: string;
    challenger: User;
    opponentId: string;
    opponent: User;
    betAmount: bigint;
    config: ChallengeConfig;
    result: ChallengeResult;
    prizePool: bigint;
    expiresAt: Date;
    startedAt: Date;
    endedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    isPending(): boolean;
    isOngoing(): boolean;
    isCompleted(): boolean;
    canAccept(): boolean;
    getWinnerId(): string | null;
    isParticipant(userId: string): boolean;
    getOpponentFor(userId: string): string | null;
}
