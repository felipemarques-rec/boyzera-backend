import { GetCurrentSeasonUseCase } from '../../use-cases/season/get-current-season.use-case';
import { CalculateSeasonRewardsUseCase } from '../../use-cases/season/calculate-season-rewards.use-case';
export declare class SeasonController {
    private getCurrentSeasonUseCase;
    private calculateSeasonRewardsUseCase;
    constructor(getCurrentSeasonUseCase: GetCurrentSeasonUseCase, calculateSeasonRewardsUseCase: CalculateSeasonRewardsUseCase);
    getCurrentSeason(): Promise<{
        success: boolean;
        data: null;
        message: string;
    } | {
        success: boolean;
        data: {
            id: string;
            name: string;
            description: string;
            status: import("../../domain/entities/season.entity").SeasonStatus;
            seasonNumber: number;
            startDate: Date;
            endDate: Date;
            bannerUrl: string;
            themeColor: string;
            prizePool: import("../../domain/entities/season.entity").SeasonPrizePool;
            daysRemaining: number;
            progressPercentage: number;
            isActive: boolean;
        };
        message?: undefined;
    }>;
    getAllSeasons(): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            status: import("../../domain/entities/season.entity").SeasonStatus;
            seasonNumber: number;
            startDate: Date;
            endDate: Date;
            isActive: boolean;
            rewardsDistributed: boolean;
        }[];
    }>;
    getSeasonHistory(): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            seasonNumber: number;
            startDate: Date;
            endDate: Date;
            prizePool: import("../../domain/entities/season.entity").SeasonPrizePool;
            rewardsDistributed: boolean;
            rewardsDistributedAt: Date;
        }[];
    }>;
    getSeasonById(id: string): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            id: string;
            name: string;
            description: string;
            status: import("../../domain/entities/season.entity").SeasonStatus;
            seasonNumber: number;
            startDate: Date;
            endDate: Date;
            bannerUrl: string;
            themeColor: string;
            prizePool: import("../../domain/entities/season.entity").SeasonPrizePool;
            daysRemaining: number;
            progressPercentage: number;
            isActive: boolean;
            rewardsDistributed: boolean;
            rewardsDistributedAt: Date;
        };
        message?: undefined;
    }>;
    getSeasonStats(id: string): Promise<{
        success: boolean;
        data: {
            totalParticipants: number;
            topPlayer: {
                userId: string;
                username: string;
                followers: string;
                rank: number;
            } | null;
            averageFollowers: string;
        };
    }>;
    getMySeasonRank(id: string, req: any): Promise<{
        success: boolean;
        data: {
            seasonId: string;
            userId: any;
            rank: number | null;
        };
    }>;
    previewSeasonRewards(id: string): Promise<{
        success: boolean;
        data: {
            seasonId: string;
            seasonName: string;
            totalParticipants: number;
            rewards: {
                userId: string;
                rank: number;
                gems: number;
                followers: string;
                tokensBz: number;
                title: string | undefined;
            }[];
            previewOnly: boolean;
        };
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        data?: undefined;
    }>;
    distributeSeasonRewards(id: string): Promise<{
        success: boolean;
        data: {
            seasonId: string;
            seasonName: string;
            totalParticipants: number;
            rewardsDistributed: number;
            distributed: boolean;
        };
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        data?: undefined;
    }>;
}
