import { TransactionService, TransactionSummary } from '../../domain/services/transaction.service';
import { Transaction, TransactionType, CurrencyType } from '../../domain/entities/transaction.entity';
export interface TransactionHistoryResult {
    transactions: Transaction[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface TransactionFilters {
    type?: TransactionType;
    currency?: CurrencyType;
    startDate?: Date;
    endDate?: Date;
}
export declare class GetTransactionHistoryUseCase {
    private transactionService;
    constructor(transactionService: TransactionService);
    execute(userId: string, page?: number, limit?: number, filters?: TransactionFilters): Promise<TransactionHistoryResult>;
    getSummary(userId: string, currency: CurrencyType, startDate?: Date, endDate?: Date): Promise<TransactionSummary>;
    getDailyStats(userId: string, currency: CurrencyType, days?: number): Promise<Array<{
        date: string;
        earned: bigint;
        spent: bigint;
    }>>;
    getRecentActivity(userId: string, limit?: number): Promise<Transaction[]>;
    getTransactionsByType(userId: string, type: TransactionType, page?: number, limit?: number): Promise<TransactionHistoryResult>;
    getFollowerTransactions(userId: string, page?: number, limit?: number): Promise<TransactionHistoryResult>;
    getGemTransactions(userId: string, page?: number, limit?: number): Promise<TransactionHistoryResult>;
    getTokenTransactions(userId: string, page?: number, limit?: number): Promise<TransactionHistoryResult>;
}
