import { User } from './user.entity';
import { Raffle } from './raffle.entity';
import { RaffleTask } from './raffle-task.entity';
export declare class RaffleTicket {
    id: string;
    userId: string;
    user: User;
    raffleId: string;
    raffle: Raffle;
    taskId: string;
    task: RaffleTask;
    ticketNumber: string;
    isWinner: boolean;
    wonAt: Date;
    createdAt: Date;
}
