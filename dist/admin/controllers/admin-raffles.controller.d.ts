import { Repository } from 'typeorm';
import { Raffle } from '../../domain/entities/raffle.entity';
import { RaffleTask } from '../../domain/entities/raffle-task.entity';
import { RaffleTicket } from '../../domain/entities/raffle-ticket.entity';
export declare class AdminRafflesController {
    private raffleRepository;
    private taskRepository;
    private ticketRepository;
    constructor(raffleRepository: Repository<Raffle>, taskRepository: Repository<RaffleTask>, ticketRepository: Repository<RaffleTicket>);
    getRaffles(): Promise<Raffle[]>;
    getRaffle(id: string): Promise<Raffle | null>;
    createRaffle(data: Partial<Raffle>): Promise<Raffle>;
    updateRaffle(id: string, data: Partial<Raffle>): Promise<Raffle | null>;
    deleteRaffle(id: string): Promise<{
        success: boolean;
    }>;
    getTasks(raffleId: string): Promise<RaffleTask[]>;
    createTask(raffleId: string, data: Partial<RaffleTask>): Promise<RaffleTask>;
    updateTask(taskId: string, data: Partial<RaffleTask>): Promise<RaffleTask | null>;
    deleteTask(taskId: string): Promise<{
        success: boolean;
    }>;
    drawWinner(id: string): Promise<{
        success: boolean;
        winners: {
            ticketNumber: string;
            userId: string;
        }[];
    }>;
    getRaffleStats(id: string): Promise<{
        totalTickets: number;
        uniqueParticipants: number;
    }>;
}
