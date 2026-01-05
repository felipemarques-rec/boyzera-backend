import { Repository } from 'typeorm';
import { Challenge, ChallengeType, ChallengeStatus } from '../../domain/entities/challenge.entity';
import { User } from '../../domain/entities/user.entity';
export declare class AdminChallengesController {
    private challengeRepository;
    private userRepository;
    constructor(challengeRepository: Repository<Challenge>, userRepository: Repository<User>);
    getChallenges(page?: number, limit?: number, type?: ChallengeType, status?: ChallengeStatus, sortBy?: string, sortOrder?: 'ASC' | 'DESC'): Promise<{
        data: {
            id: string;
            type: ChallengeType;
            status: ChallengeStatus;
            challenger: {
                id: string;
                username: string;
                firstName: string;
            } | null;
            opponent: {
                id: string;
                username: string;
                firstName: string;
            } | null;
            betAmount: string;
            prizePool: string;
            config: import("../../domain/entities/challenge.entity").ChallengeConfig;
            result: import("../../domain/entities/challenge.entity").ChallengeResult;
            startedAt: Date;
            endedAt: Date;
            createdAt: Date;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getStats(): Promise<{
        total: number;
        todayChallenges: number;
        totalBetsAmount: any;
        byStatus: Record<string, number>;
        byType: Record<string, number>;
        topChallengers: {
            userId: any;
            username: string | undefined;
            firstName: string | undefined;
            challengeCount: number;
        }[];
    }>;
    getChallenge(id: string): Promise<{
        error: string;
    } | {
        betAmount: string;
        prizePool: string;
        challenger: {
            id: string;
            username: string;
            firstName: string;
            lastName: string;
        } | null;
        opponent: {
            id: string;
            username: string;
            firstName: string;
            lastName: string;
        } | null;
        id: string;
        type: ChallengeType;
        status: ChallengeStatus;
        challengerId: string;
        opponentId: string;
        config: import("../../domain/entities/challenge.entity").ChallengeConfig;
        result: import("../../domain/entities/challenge.entity").ChallengeResult;
        expiresAt: Date;
        startedAt: Date;
        endedAt: Date;
        createdAt: Date;
        updatedAt: Date;
        error?: undefined;
    }>;
    getUserChallenges(userId: string, page?: number, limit?: number): Promise<{
        user: {
            id: string;
            username: string;
            firstName: string;
        } | null;
        stats: {
            total: number;
            wins: number;
            losses: number;
            ties: number;
            winRate: number;
        };
        data: {
            id: string;
            type: ChallengeType;
            status: ChallengeStatus;
            challenger: {
                id: string;
                username: string;
                firstName: string;
            } | null;
            opponent: {
                id: string;
                username: string;
                firstName: string;
            } | null;
            betAmount: string;
            result: import("../../domain/entities/challenge.entity").ChallengeResult;
            createdAt: Date;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
}
