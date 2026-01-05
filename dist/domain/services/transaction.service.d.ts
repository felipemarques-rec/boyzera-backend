import { Repository } from 'typeorm';
import { Transaction, TransactionType, CurrencyType, TransactionMetadata } from '../entities/transaction.entity';
import { User } from '../entities/user.entity';
export interface CreateTransactionParams {
    userId: string;
    type: TransactionType;
    currency: CurrencyType;
    amount: bigint;
    metadata?: TransactionMetadata;
    seasonId?: string;
}
export interface TransactionSummary {
    totalEarned: bigint;
    totalSpent: bigint;
    netBalance: bigint;
    transactionCount: number;
    byType: Record<TransactionType, bigint>;
}
export declare class TransactionService {
    private transactionRepository;
    private userRepository;
    constructor(transactionRepository: Repository<Transaction>, userRepository: Repository<User>);
    createTransaction(params: CreateTransactionParams): Promise<Transaction>;
    createTransactionBatch(transactions: CreateTransactionParams[]): Promise<Transaction[]>;
    private getUserBalance;
    getTransactionHistory(userId: string, options?: {
        limit?: number;
        offset?: number;
        type?: TransactionType;
        currency?: CurrencyType;
        startDate?: Date;
        endDate?: Date;
    }): Promise<{
        transactions: Transaction[];
        total: number;
    }>;
    getTransactionSummary(userId: string, currency: CurrencyType, startDate?: Date, endDate?: Date): Promise<TransactionSummary>;
    getDailyStats(userId: string, currency: CurrencyType, days?: number): Promise<Array<{
        date: string;
        earned: bigint;
        spent: bigint;
    }>>;
}
