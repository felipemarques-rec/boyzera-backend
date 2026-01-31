import { RaffleService } from '../../infrastructure/raffle/raffle.service';
export declare class RaffleController {
    private readonly raffleService;
    constructor(raffleService: RaffleService);
    getActiveRaffles(req: any): Promise<{
        userTicketCount: number;
        isStarted: boolean;
        isEnded: boolean;
        id: string;
        title: string;
        description: string;
        imageUrl: string;
        bannerUrl: string;
        status: import("../../domain/entities/raffle.entity").RaffleStatus;
        prizeType: import("../../domain/entities/raffle.entity").RafflePrizeType;
        prizeName: string;
        prizeDescription: string;
        prizeImageUrl: string;
        prizeFollowersAmount: string;
        prizeGemsAmount: number;
        prizeTokensAmount: number;
        startsAt: Date;
        endsAt: Date;
        drawAt: Date;
        maxTicketsPerUser: number;
        totalTickets: number;
        numberOfWinners: number;
        requiredLevel: number;
    }[]>;
    getMyTickets(req: any, raffleId?: string): Promise<{
        id: string;
        ticketNumber: string;
        raffleName: string;
        raffleId: string;
        isWinner: boolean;
        createdAt: Date;
    }[]>;
    getWinners(raffleId?: string): Promise<{
        raffleId: string;
        raffleName: string;
        ticketNumber: string;
        userId: string;
        username: string;
        wonAt: Date;
    }[]>;
    getRaffleDetails(req: any, raffleId: string): Promise<{
        tasks: {
            userStatus: import("../../domain/entities/user-raffle-task.entity").UserRaffleTaskStatus | null;
            isCompleted: boolean;
            ticketsClaimed: boolean;
            id: string;
            type: import("../../domain/entities/raffle-task.entity").RaffleTaskType;
            title: string;
            description: string;
            iconUrl: string;
            targetUrl: string;
            ticketsReward: number;
            requiresManualVerification: boolean;
        }[];
        userTickets: {
            id: string;
            ticketNumber: string;
            createdAt: Date;
        }[];
        userTicketCount: number;
        id: string;
        title: string;
        description: string;
        imageUrl: string;
        bannerUrl: string;
        status: import("../../domain/entities/raffle.entity").RaffleStatus;
        prizeType: import("../../domain/entities/raffle.entity").RafflePrizeType;
        prizeName: string;
        prizeDescription: string;
        prizeImageUrl: string;
        prizeFollowersAmount: string;
        prizeGemsAmount: number;
        prizeTokensAmount: number;
        startsAt: Date;
        endsAt: Date;
        drawAt: Date;
        maxTicketsPerUser: number;
        totalTickets: number;
        numberOfWinners: number;
        requiredLevel: number;
    }>;
    startTask(req: any, raffleId: string, taskId: string): Promise<{
        success: boolean;
        message: string;
        status: import("../../domain/entities/user-raffle-task.entity").UserRaffleTaskStatus.VERIFYING;
        targetUrl?: undefined;
    } | {
        success: boolean;
        message: string;
        status: import("../../domain/entities/user-raffle-task.entity").UserRaffleTaskStatus.VERIFYING;
        targetUrl: string;
    }>;
    verifyTask(req: any, raffleId: string, taskId: string): Promise<{
        success: boolean;
        message: string;
        status: import("../../domain/entities/user-raffle-task.entity").UserRaffleTaskStatus.COMPLETED;
        canClaimTickets: boolean;
        ticketsReward: number;
    } | {
        success: boolean;
        message: string;
        status: import("../../domain/entities/user-raffle-task.entity").UserRaffleTaskStatus.FAILED;
        canClaimTickets?: undefined;
        ticketsReward?: undefined;
    }>;
    claimTickets(req: any, raffleId: string, taskId: string): Promise<{
        success: boolean;
        message: string;
        tickets: {
            id: string;
            ticketNumber: string;
        }[];
        totalUserTickets: number;
    }>;
}
