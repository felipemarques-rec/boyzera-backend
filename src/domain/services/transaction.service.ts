import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Transaction,
  TransactionType,
  CurrencyType,
  TransactionMetadata,
} from '../entities/transaction.entity';
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

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createTransaction(
    params: CreateTransactionParams,
  ): Promise<Transaction> {
    const user = await this.userRepository.findOne({
      where: { id: params.userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Get current balance based on currency type
    const balanceBefore = this.getUserBalance(user, params.currency);

    // Calculate new balance
    const balanceAfter = balanceBefore + params.amount;

    // Create transaction record
    const transaction = this.transactionRepository.create({
      userId: params.userId,
      type: params.type,
      currency: params.currency,
      amount: params.amount,
      balanceBefore,
      balanceAfter,
      metadata: params.metadata,
      seasonId: params.seasonId,
    });

    return this.transactionRepository.save(transaction);
  }

  async createTransactionBatch(
    transactions: CreateTransactionParams[],
  ): Promise<Transaction[]> {
    const results: Transaction[] = [];

    for (const params of transactions) {
      const transaction = await this.createTransaction(params);
      results.push(transaction);
    }

    return results;
  }

  private getUserBalance(user: User, currency: CurrencyType): bigint {
    switch (currency) {
      case CurrencyType.FOLLOWERS:
        return user.followers;
      case CurrencyType.GEMS:
        return BigInt(user.gems);
      case CurrencyType.TOKENS_BZ:
        return BigInt(Math.floor(user.tokensBz * 100)); // Store as cents
      default:
        return BigInt(0);
    }
  }

  async getTransactionHistory(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      type?: TransactionType;
      currency?: CurrencyType;
      startDate?: Date;
      endDate?: Date;
    } = {},
  ): Promise<{ transactions: Transaction[]; total: number }> {
    const {
      limit = 50,
      offset = 0,
      type,
      currency,
      startDate,
      endDate,
    } = options;

    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.userId = :userId', { userId })
      .orderBy('transaction.createdAt', 'DESC');

    if (type) {
      queryBuilder.andWhere('transaction.type = :type', { type });
    }

    if (currency) {
      queryBuilder.andWhere('transaction.currency = :currency', { currency });
    }

    if (startDate) {
      queryBuilder.andWhere('transaction.createdAt >= :startDate', {
        startDate,
      });
    }

    if (endDate) {
      queryBuilder.andWhere('transaction.createdAt <= :endDate', { endDate });
    }

    const [transactions, total] = await queryBuilder
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return { transactions, total };
  }

  async getTransactionSummary(
    userId: string,
    currency: CurrencyType,
    startDate?: Date,
    endDate?: Date,
  ): Promise<TransactionSummary> {
    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.currency = :currency', { currency });

    if (startDate) {
      queryBuilder.andWhere('transaction.createdAt >= :startDate', {
        startDate,
      });
    }

    if (endDate) {
      queryBuilder.andWhere('transaction.createdAt <= :endDate', { endDate });
    }

    const transactions = await queryBuilder.getMany();

    const summary: TransactionSummary = {
      totalEarned: BigInt(0),
      totalSpent: BigInt(0),
      netBalance: BigInt(0),
      transactionCount: transactions.length,
      byType: {} as Record<TransactionType, bigint>,
    };

    // Initialize all transaction types with 0
    Object.values(TransactionType).forEach((type) => {
      summary.byType[type] = BigInt(0);
    });

    for (const transaction of transactions) {
      const amount = transaction.amount;

      if (amount > BigInt(0)) {
        summary.totalEarned += amount;
      } else {
        summary.totalSpent += -amount;
      }

      summary.byType[transaction.type] += amount;
    }

    summary.netBalance = summary.totalEarned - summary.totalSpent;

    return summary;
  }

  async getDailyStats(
    userId: string,
    currency: CurrencyType,
    days: number = 7,
  ): Promise<Array<{ date: string; earned: bigint; spent: bigint }>> {
    const stats: Array<{ date: string; earned: bigint; spent: bigint }> = [];

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayTransactions = await this.transactionRepository.find({
        where: {
          userId,
          currency,
        },
      });

      // Filter by date in memory (for BigInt compatibility)
      const filteredTransactions = dayTransactions.filter(
        (t) => t.createdAt >= date && t.createdAt < nextDate,
      );

      let earned = BigInt(0);
      let spent = BigInt(0);

      for (const transaction of filteredTransactions) {
        if (transaction.amount > BigInt(0)) {
          earned += transaction.amount;
        } else {
          spent += -transaction.amount;
        }
      }

      stats.push({
        date: date.toISOString().split('T')[0],
        earned,
        spent,
      });
    }

    return stats.reverse();
  }
}
