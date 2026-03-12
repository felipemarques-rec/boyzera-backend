import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, DataSource, Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User } from '../../domain/entities/user.entity';
import { DailyAwardConfig } from '../../domain/entities/daily-award-config.entity';
import {
  CurrencyType,
  Transaction,
  TransactionType,
} from '../../domain/entities/transaction.entity';
import { DailyAwardService } from '../../domain/services/daily-award.service';

export interface DailyAwardClaimResponse {
  date: string;
  econ_version: string;
  streak: number;
  engagement: number;
  delta_followers: string;
  followers_balance_before: string;
  followers_balance_after: string;
}

@Injectable()
export class ClaimDailyAwardUseCase {
  private readonly logger = new Logger(ClaimDailyAwardUseCase.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(DailyAwardConfig)
    private readonly dailyAwardConfigRepository: Repository<DailyAwardConfig>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly dailyAwardService: DailyAwardService,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(userId: string): Promise<DailyAwardClaimResponse> {
    const now = new Date();
    const todayStart = this.startOfDay(now);
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isBanned) {
      throw new BadRequestException('User is banned');
    }

    const alreadyClaimedToday =
      !!user.lastDailyAwardDate &&
      this.isSameDate(user.lastDailyAwardDate, now);

    if (alreadyClaimedToday) {
      const existing = await this.findExistingClaim(
        userId,
        todayStart,
        tomorrowStart,
      );
      if (existing) {
        return this.toResponse(existing);
      }

      // Fallback to keep idempotency even if the audit trail is missing.
      return {
        date: this.formatDate(now),
        econ_version: 'unknown',
        streak: Math.max(1, user.loginStreak || 1),
        engagement: this.clamp(Number(user.dailyEngagement) || 0, 0, 1),
        delta_followers: '0',
        followers_balance_before: user.followers.toString(),
        followers_balance_after: user.followers.toString(),
      };
    }

    const config = await this.dailyAwardConfigRepository.findOne({
      where: { isActive: true },
    });

    if (!config) {
      throw new BadRequestException('No active DailyAwardConfig found');
    }

    const streak = this.calculateUpdatedStreak(user, todayStart);
    const award = this.dailyAwardService.calculateDailyFollowersGain(
      user.followers,
      Number(user.dailyEngagement) || 0,
      streak,
      config,
    );

    const balanceBefore = user.followers;
    const balanceAfter = balanceBefore + award.deltaFollowers;

    const response: DailyAwardClaimResponse = {
      date: this.formatDate(now),
      econ_version: config.version,
      streak,
      engagement: award.engagement,
      delta_followers: award.deltaFollowers.toString(),
      followers_balance_before: balanceBefore.toString(),
      followers_balance_after: balanceAfter.toString(),
    };

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.update(User, user.id, {
        followers: balanceAfter,
        loginStreak: streak,
        lastStreakDate: now,
        lastLoginAt: now,
        lastDailyAwardDate: now,
      });

      const transaction = queryRunner.manager.create(Transaction, {
        userId: user.id,
        type: TransactionType.REWARD,
        currency: CurrencyType.FOLLOWERS,
        amount: award.deltaFollowers,
        balanceBefore,
        balanceAfter,
        metadata: {
          description: 'daily_award_claim',
          econVersion: config.version,
          date: response.date,
          streak,
          engagement: award.engagement,
          rawDelta: award.rawDelta,
        } as any,
      });

      await queryRunner.manager.save(transaction);
      await queryRunner.commitTransaction();

      this.eventEmitter.emit('daily_award_claimed', {
        user_id: user.id,
        econ_version: config.version,
        followers_before: balanceBefore.toString(),
        followers_after: balanceAfter.toString(),
        streak,
        engagement: award.engagement,
        delta_followers: award.deltaFollowers.toString(),
        timestamp: now.toISOString(),
      });

      this.logger.log(
        `Daily award claimed for ${user.id}: +${award.deltaFollowers.toString()} followers (streak ${streak}, E=${award.engagement.toFixed(3)})`,
      );

      return response;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async findExistingClaim(
    userId: string,
    todayStart: Date,
    tomorrowStart: Date,
  ): Promise<Transaction | null> {
    const rewards = await this.transactionRepository.find({
      where: {
        userId,
        type: TransactionType.REWARD,
        currency: CurrencyType.FOLLOWERS,
        createdAt: Between(todayStart, tomorrowStart),
      },
      order: { createdAt: 'DESC' },
    });

    return (
      rewards.find(
        (tx) => (tx.metadata as any)?.description === 'daily_award_claim',
      ) || null
    );
  }

  private toResponse(transaction: Transaction): DailyAwardClaimResponse {
    const metadata = (transaction.metadata || {}) as any;
    const date = metadata.date || this.formatDate(transaction.createdAt);

    return {
      date,
      econ_version: metadata.econVersion || 'unknown',
      streak: Number(metadata.streak || 1),
      engagement: Number(metadata.engagement || 0),
      delta_followers: transaction.amount.toString(),
      followers_balance_before: (transaction.balanceBefore || 0n).toString(),
      followers_balance_after: (transaction.balanceAfter || 0n).toString(),
    };
  }

  private calculateUpdatedStreak(user: User, todayStart: Date): number {
    if (!user.lastStreakDate) {
      return 1;
    }

    const lastStreakDay = this.startOfDay(new Date(user.lastStreakDate));
    const yesterday = new Date(todayStart);
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastStreakDay.getTime() === todayStart.getTime()) {
      return Math.max(1, user.loginStreak || 1);
    }

    if (lastStreakDay.getTime() === yesterday.getTime()) {
      return Math.max(1, user.loginStreak || 0) + 1;
    }

    return 1;
  }

  private startOfDay(date: Date): Date {
    const day = new Date(date);
    day.setHours(0, 0, 0, 0);
    return day;
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private isSameDate(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }
}
