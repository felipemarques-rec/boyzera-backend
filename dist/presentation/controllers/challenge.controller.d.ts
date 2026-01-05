import { CreateChallengeUseCase } from '../../use-cases/challenge/create-challenge.use-case';
import { AcceptChallengeUseCase } from '../../use-cases/challenge/accept-challenge.use-case';
import { CompleteChallengeUseCase } from '../../use-cases/challenge/complete-challenge.use-case';
import { ChallengeType } from '../../domain/entities/challenge.entity';
declare class CreateChallengeDto {
    opponentId: string;
    type: ChallengeType;
    betAmount: string;
    config?: {
        duration?: number;
        rounds?: number;
        difficulty?: 'easy' | 'medium' | 'hard';
    };
}
declare class SubmitScoreDto {
    score: number;
}
export declare class ChallengeController {
    private createChallengeUseCase;
    private acceptChallengeUseCase;
    private completeChallengeUseCase;
    constructor(createChallengeUseCase: CreateChallengeUseCase, acceptChallengeUseCase: AcceptChallengeUseCase, completeChallengeUseCase: CompleteChallengeUseCase);
    createChallenge(req: any, dto: CreateChallengeDto): Promise<{
        success: boolean;
        data: {
            id: any;
            type: any;
            status: any;
            challengerId: any;
            challengerUsername: any;
            opponentId: any;
            opponentUsername: any;
            betAmount: any;
            prizePool: any;
            config: any;
            result: {
                challengerScore: any;
                opponentScore: any;
                winnerId: any;
            } | null;
            expiresAt: any;
            startedAt: any;
            endedAt: any;
            createdAt: any;
        };
    }>;
    getPendingChallenges(req: any): Promise<{
        success: boolean;
        data: {
            id: any;
            type: any;
            status: any;
            challengerId: any;
            challengerUsername: any;
            opponentId: any;
            opponentUsername: any;
            betAmount: any;
            prizePool: any;
            config: any;
            result: {
                challengerScore: any;
                opponentScore: any;
                winnerId: any;
            } | null;
            expiresAt: any;
            startedAt: any;
            endedAt: any;
            createdAt: any;
        }[];
    }>;
    getActiveChallenges(req: any): Promise<{
        success: boolean;
        data: {
            id: any;
            type: any;
            status: any;
            challengerId: any;
            challengerUsername: any;
            opponentId: any;
            opponentUsername: any;
            betAmount: any;
            prizePool: any;
            config: any;
            result: {
                challengerScore: any;
                opponentScore: any;
                winnerId: any;
            } | null;
            expiresAt: any;
            startedAt: any;
            endedAt: any;
            createdAt: any;
        }[];
    }>;
    acceptChallenge(id: string, req: any): Promise<{
        success: boolean;
        data: {
            id: any;
            type: any;
            status: any;
            challengerId: any;
            challengerUsername: any;
            opponentId: any;
            opponentUsername: any;
            betAmount: any;
            prizePool: any;
            config: any;
            result: {
                challengerScore: any;
                opponentScore: any;
                winnerId: any;
            } | null;
            expiresAt: any;
            startedAt: any;
            endedAt: any;
            createdAt: any;
        };
    }>;
    startChallenge(id: string): Promise<{
        success: boolean;
        data: {
            id: any;
            type: any;
            status: any;
            challengerId: any;
            challengerUsername: any;
            opponentId: any;
            opponentUsername: any;
            betAmount: any;
            prizePool: any;
            config: any;
            result: {
                challengerScore: any;
                opponentScore: any;
                winnerId: any;
            } | null;
            expiresAt: any;
            startedAt: any;
            endedAt: any;
            createdAt: any;
        };
    }>;
    declineChallenge(id: string, req: any): Promise<{
        success: boolean;
        data: {
            id: any;
            type: any;
            status: any;
            challengerId: any;
            challengerUsername: any;
            opponentId: any;
            opponentUsername: any;
            betAmount: any;
            prizePool: any;
            config: any;
            result: {
                challengerScore: any;
                opponentScore: any;
                winnerId: any;
            } | null;
            expiresAt: any;
            startedAt: any;
            endedAt: any;
            createdAt: any;
        };
        message: string;
    }>;
    cancelChallenge(id: string, req: any): Promise<{
        success: boolean;
        data: {
            id: any;
            type: any;
            status: any;
            challengerId: any;
            challengerUsername: any;
            opponentId: any;
            opponentUsername: any;
            betAmount: any;
            prizePool: any;
            config: any;
            result: {
                challengerScore: any;
                opponentScore: any;
                winnerId: any;
            } | null;
            expiresAt: any;
            startedAt: any;
            endedAt: any;
            createdAt: any;
        };
        message: string;
    }>;
    submitScore(id: string, req: any, dto: SubmitScoreDto): Promise<{
        success: boolean;
        data: {
            challenge: {
                id: any;
                type: any;
                status: any;
                challengerId: any;
                challengerUsername: any;
                opponentId: any;
                opponentUsername: any;
                betAmount: any;
                prizePool: any;
                config: any;
                result: {
                    challengerScore: any;
                    opponentScore: any;
                    winnerId: any;
                } | null;
                expiresAt: any;
                startedAt: any;
                endedAt: any;
                createdAt: any;
            };
            isComplete: boolean;
        };
    }>;
    getChallengeHistory(req: any, limit: number): Promise<{
        success: boolean;
        data: {
            id: any;
            type: any;
            status: any;
            challengerId: any;
            challengerUsername: any;
            opponentId: any;
            opponentUsername: any;
            betAmount: any;
            prizePool: any;
            config: any;
            result: {
                challengerScore: any;
                opponentScore: any;
                winnerId: any;
            } | null;
            expiresAt: any;
            startedAt: any;
            endedAt: any;
            createdAt: any;
        }[];
    }>;
    getChallengeStats(req: any): Promise<{
        success: boolean;
        data: {
            totalChallenges: number;
            wins: number;
            losses: number;
            ties: number;
            winRate: string;
            totalEarned: string;
            totalLost: string;
        };
    }>;
    private formatChallenge;
}
export {};
