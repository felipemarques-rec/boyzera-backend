import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetTransactionHistoryUseCase } from '../../use-cases/transaction/get-transaction-history.use-case';
import {
  TransactionType,
  CurrencyType,
} from '../../domain/entities/transaction.entity';

@Controller('transactions')
@UseGuards(AuthGuard('jwt'))
export class TransactionController {
  constructor(
    private getTransactionHistoryUseCase: GetTransactionHistoryUseCase,
  ) {}

  @Get()
  async getTransactionHistory(
    @Request() req: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('type') type?: TransactionType,
    @Query('currency') currency?: CurrencyType,
  ) {
    const userId = req.user.id;
    const result = await this.getTransactionHistoryUseCase.execute(
      userId,
      page,
      Math.min(limit, 100), // Cap at 100
      { type, currency },
    );

    return {
      success: true,
      data: {
        transactions: result.transactions.map((tx) => ({
          id: tx.id,
          type: tx.type,
          currency: tx.currency,
          amount: tx.amount.toString(),
          balanceBefore: tx.balanceBefore?.toString() ?? null,
          balanceAfter: tx.balanceAfter?.toString() ?? null,
          metadata: tx.metadata,
          createdAt: tx.createdAt,
        })),
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      },
    };
  }

  @Get('recent')
  async getRecentActivity(
    @Request() req: any,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const userId = req.user.id;
    const transactions =
      await this.getTransactionHistoryUseCase.getRecentActivity(
        userId,
        Math.min(limit, 20),
      );

    return {
      success: true,
      data: transactions.map((tx) => ({
        id: tx.id,
        type: tx.type,
        currency: tx.currency,
        amount: tx.amount.toString(),
        metadata: tx.metadata,
        createdAt: tx.createdAt,
      })),
    };
  }

  @Get('summary')
  async getTransactionSummary(
    @Request() req: any,
    @Query('currency') currency: CurrencyType = CurrencyType.FOLLOWERS,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const userId = req.user.id;
    const summary = await this.getTransactionHistoryUseCase.getSummary(
      userId,
      currency,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );

    // Convert byType BigInts to strings
    const byTypeStrings: Record<string, string> = {};
    for (const [key, value] of Object.entries(summary.byType)) {
      byTypeStrings[key] = value.toString();
    }

    return {
      success: true,
      data: {
        currency,
        totalEarned: summary.totalEarned.toString(),
        totalSpent: summary.totalSpent.toString(),
        netBalance: summary.netBalance.toString(),
        transactionCount: summary.transactionCount,
        byType: byTypeStrings,
      },
    };
  }

  @Get('daily-stats')
  async getDailyStats(
    @Request() req: any,
    @Query('currency') currency: CurrencyType = CurrencyType.FOLLOWERS,
    @Query('days', new DefaultValuePipe(7), ParseIntPipe) days: number,
  ) {
    const userId = req.user.id;
    const stats = await this.getTransactionHistoryUseCase.getDailyStats(
      userId,
      currency,
      Math.min(days, 30),
    );

    return {
      success: true,
      data: stats.map((day) => ({
        date: day.date,
        earned: day.earned.toString(),
        spent: day.spent.toString(),
      })),
    };
  }

  @Get('followers')
  async getFollowerTransactions(
    @Request() req: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    const userId = req.user.id;
    const result =
      await this.getTransactionHistoryUseCase.getFollowerTransactions(
        userId,
        page,
        Math.min(limit, 100),
      );

    return {
      success: true,
      data: {
        transactions: result.transactions.map((tx) => ({
          id: tx.id,
          type: tx.type,
          amount: tx.amount.toString(),
          metadata: tx.metadata,
          createdAt: tx.createdAt,
        })),
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      },
    };
  }

  @Get('gems')
  async getGemTransactions(
    @Request() req: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    const userId = req.user.id;
    const result = await this.getTransactionHistoryUseCase.getGemTransactions(
      userId,
      page,
      Math.min(limit, 100),
    );

    return {
      success: true,
      data: {
        transactions: result.transactions.map((tx) => ({
          id: tx.id,
          type: tx.type,
          amount: tx.amount.toString(),
          metadata: tx.metadata,
          createdAt: tx.createdAt,
        })),
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      },
    };
  }

  @Get('tokens')
  async getTokenTransactions(
    @Request() req: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    const userId = req.user.id;
    const result = await this.getTransactionHistoryUseCase.getTokenTransactions(
      userId,
      page,
      Math.min(limit, 100),
    );

    return {
      success: true,
      data: {
        transactions: result.transactions.map((tx) => ({
          id: tx.id,
          type: tx.type,
          amount: tx.amount.toString(),
          metadata: tx.metadata,
          createdAt: tx.createdAt,
        })),
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      },
    };
  }
}
