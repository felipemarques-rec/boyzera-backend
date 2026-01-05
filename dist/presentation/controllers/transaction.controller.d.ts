import { GetTransactionHistoryUseCase } from '../../use-cases/transaction/get-transaction-history.use-case';
import { TransactionType, CurrencyType } from '../../domain/entities/transaction.entity';
export declare class TransactionController {
    private getTransactionHistoryUseCase;
    constructor(getTransactionHistoryUseCase: GetTransactionHistoryUseCase);
    getTransactionHistory(req: any, page: number, limit: number, type?: TransactionType, currency?: CurrencyType): Promise<{
        success: boolean;
        data: {
            transactions: {
                id: string;
                type: TransactionType;
                currency: CurrencyType;
                amount: string;
                balanceBefore: string | null;
                balanceAfter: string | null;
                metadata: import("../../domain/entities/transaction.entity").TransactionMetadata;
                createdAt: Date;
            }[];
            pagination: {
                page: number;
                limit: number;
                total: number;
                totalPages: number;
            };
        };
    }>;
    getRecentActivity(req: any, limit: number): Promise<{
        success: boolean;
        data: {
            id: string;
            type: TransactionType;
            currency: CurrencyType;
            amount: string;
            metadata: import("../../domain/entities/transaction.entity").TransactionMetadata;
            createdAt: Date;
        }[];
    }>;
    getTransactionSummary(req: any, currency?: CurrencyType, startDate?: string, endDate?: string): Promise<{
        success: boolean;
        data: {
            currency: CurrencyType;
            totalEarned: string;
            totalSpent: string;
            netBalance: string;
            transactionCount: number;
            byType: Record<string, string>;
        };
    }>;
    getDailyStats(req: any, currency: CurrencyType | undefined, days: number): Promise<{
        success: boolean;
        data: {
            date: string;
            earned: string;
            spent: string;
        }[];
    }>;
    getFollowerTransactions(req: any, page: number, limit: number): Promise<{
        success: boolean;
        data: {
            transactions: {
                id: string;
                type: TransactionType;
                amount: string;
                metadata: import("../../domain/entities/transaction.entity").TransactionMetadata;
                createdAt: Date;
            }[];
            pagination: {
                page: number;
                limit: number;
                total: number;
                totalPages: number;
            };
        };
    }>;
    getGemTransactions(req: any, page: number, limit: number): Promise<{
        success: boolean;
        data: {
            transactions: {
                id: string;
                type: TransactionType;
                amount: string;
                metadata: import("../../domain/entities/transaction.entity").TransactionMetadata;
                createdAt: Date;
            }[];
            pagination: {
                page: number;
                limit: number;
                total: number;
                totalPages: number;
            };
        };
    }>;
    getTokenTransactions(req: any, page: number, limit: number): Promise<{
        success: boolean;
        data: {
            transactions: {
                id: string;
                type: TransactionType;
                amount: string;
                metadata: import("../../domain/entities/transaction.entity").TransactionMetadata;
                createdAt: Date;
            }[];
            pagination: {
                page: number;
                limit: number;
                total: number;
                totalPages: number;
            };
        };
    }>;
}
