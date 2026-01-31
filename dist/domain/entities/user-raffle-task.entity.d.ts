import { User } from './user.entity';
import { RaffleTask } from './raffle-task.entity';
import { Raffle } from './raffle.entity';
export declare enum UserRaffleTaskStatus {
    PENDING = "PENDING",
    VERIFYING = "VERIFYING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    REJECTED = "REJECTED"
}
export declare class UserRaffleTask {
    id: string;
    userId: string;
    user: User;
    taskId: string;
    task: RaffleTask;
    raffleId: string;
    raffle: Raffle;
    status: UserRaffleTaskStatus;
    verificationData: string;
    verifiedAt: Date;
    ticketsClaimed: boolean;
    failureReason: string;
    createdAt: Date;
}
