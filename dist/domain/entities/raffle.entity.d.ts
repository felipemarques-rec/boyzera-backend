import { RaffleTicket } from './raffle-ticket.entity';
import { RaffleTask } from './raffle-task.entity';
export declare enum RaffleStatus {
    UPCOMING = "UPCOMING",
    ACTIVE = "ACTIVE",
    DRAWING = "DRAWING",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
export declare enum RafflePrizeType {
    FOLLOWERS = "FOLLOWERS",
    GEMS = "GEMS",
    TOKENS = "TOKENS",
    PHYSICAL_ITEM = "PHYSICAL_ITEM",
    IN_GAME_ITEM = "IN_GAME_ITEM",
    EXCLUSIVE_SKIN = "EXCLUSIVE_SKIN"
}
export declare class Raffle {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    bannerUrl: string;
    status: RaffleStatus;
    prizeType: RafflePrizeType;
    prizeName: string;
    prizeDescription: string;
    prizeImageUrl: string;
    prizeFollowersAmount: bigint;
    prizeGemsAmount: number;
    prizeTokensAmount: number;
    startsAt: Date;
    endsAt: Date;
    drawAt: Date;
    maxTicketsPerUser: number;
    totalTickets: number;
    numberOfWinners: number;
    requiredLevel: number;
    isActive: boolean;
    sortOrder: number;
    winnerId: string;
    winnerIds: string[];
    tickets: RaffleTicket[];
    tasks: RaffleTask[];
    createdAt: Date;
    updatedAt: Date;
}
