import { Repository } from 'typeorm';
import { User } from '../../domain/entities/user.entity';
import { Raffle, RaffleStatus } from '../../domain/entities/raffle.entity';
import { RaffleTicket } from '../../domain/entities/raffle-ticket.entity';
import { RaffleTask } from '../../domain/entities/raffle-task.entity';
import { UserRaffleTask, UserRaffleTaskStatus } from '../../domain/entities/user-raffle-task.entity';
export declare class RaffleService {
    private userRepository;
    private raffleRepository;
    private ticketRepository;
    private taskRepository;
    private userTaskRepository;
    constructor(userRepository: Repository<User>, raffleRepository: Repository<Raffle>, ticketRepository: Repository<RaffleTicket>, taskRepository: Repository<RaffleTask>, userTaskRepository: Repository<UserRaffleTask>);
    getActiveRaffles(userId: string): Promise<{
        userTicketCount: number;
        isStarted: boolean;
        isEnded: boolean;
        id: string;
        title: string;
        description: string;
        imageUrl: string;
        bannerUrl: string;
        status: RaffleStatus;
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
    getRaffleDetails(userId: string, raffleId: string): Promise<{
        tasks: {
            userStatus: UserRaffleTaskStatus | null;
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
        status: RaffleStatus;
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
    startTaskVerification(userId: string, raffleId: string, taskId: string): Promise<{
        success: boolean;
        message: string;
        status: UserRaffleTaskStatus.VERIFYING;
        targetUrl?: undefined;
    } | {
        success: boolean;
        message: string;
        status: UserRaffleTaskStatus.VERIFYING;
        targetUrl: string;
    }>;
    verifyTask(userId: string, raffleId: string, taskId: string): Promise<{
        success: boolean;
        message: string;
        status: UserRaffleTaskStatus.COMPLETED;
        canClaimTickets: boolean;
        ticketsReward: number;
    } | {
        success: boolean;
        message: string;
        status: UserRaffleTaskStatus.FAILED;
        canClaimTickets?: undefined;
        ticketsReward?: undefined;
    }>;
    claimTickets(userId: string, raffleId: string, taskId: string): Promise<{
        success: boolean;
        message: string;
        tickets: {
            id: string;
            ticketNumber: string;
        }[];
        totalUserTickets: number;
    }>;
    getUserTickets(userId: string, raffleId?: string): Promise<{
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
    private performExternalVerification;
    private generateTicketNumber;
    private formatRaffle;
    private formatTask;
}
