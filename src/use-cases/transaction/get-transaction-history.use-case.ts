import { Injectable } from '@nestjs/common';
import {
  TransactionService,
  TransactionSummary,
} from '../../domain/services/transaction.service';
import {
  Transaction,
  TransactionType,
  CurrencyType,
} from '../../domain/entities/transaction.entity';

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

@Injectable()
export class GetTransactionHistoryUseCase {
  constructor(private transactionService: TransactionService) {}

  async execute(
    userId: string,
    page: number = 1,
    limit: number = 50,
    filters: TransactionFilters = {},
  ): Promise<TransactionHistoryResult> {
    const offset = (page - 1) * limit;

    const { transactions, total } =
      await this.transactionService.getTransactionHistory(userId, {
        limit,
        offset,
        type: filters.type,
        currency: filters.currency,
        startDate: filters.startDate,
        endDate: filters.endDate,
      });

    return {
      transactions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getSummary(
    userId: string,
    currency: CurrencyType,
    startDate?: Date,
    endDate?: Date,
  ): Promise<TransactionSummary> {
    return this.transactionService.getTransactionSummary(
      userId,
      currency,
      startDate,
      endDate,
    );
  }

  async getDailyStats(
    userId: string,
    currency: CurrencyType,
    days: number = 7,
  ): Promise<Array<{ date: string; earned: bigint; spent: bigint }>> {
    return this.transactionService.getDailyStats(userId, currency, days);
  }

  async getRecentActivity(
    userId: string,
    limit: number = 10,
  ): Promise<Transaction[]> {
    const { transactions } =
      await this.transactionService.getTransactionHistory(userId, { limit });
    return transactions;
  }

  async getTransactionsByType(
    userId: string,
    type: TransactionType,
    page: number = 1,
    limit: number = 50,
  ): Promise<TransactionHistoryResult> {
    return this.execute(userId, page, limit, { type });
  }

  async getFollowerTransactions(
    userId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<TransactionHistoryResult> {
    return this.execute(userId, page, limit, {
      currency: CurrencyType.FOLLOWERS,
    });
  }

  async getGemTransactions(
    userId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<TransactionHistoryResult> {
    return this.execute(userId, page, limit, { currency: CurrencyType.GEMS });
  }

  async getTokenTransactions(
    userId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<TransactionHistoryResult> {
    return this.execute(userId, page, limit, {
      currency: CurrencyType.TOKENS_BZ,
    });
  }
}
