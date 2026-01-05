import { Injectable } from '@nestjs/common';
import {
  TransactionService,
  CreateTransactionParams,
} from '../../domain/services/transaction.service';
import {
  Transaction,
  TransactionType,
  CurrencyType,
  TransactionMetadata,
} from '../../domain/entities/transaction.entity';

@Injectable()
export class CreateTransactionUseCase {
  constructor(private transactionService: TransactionService) {}

  async execute(params: CreateTransactionParams): Promise<Transaction> {
    return this.transactionService.createTransaction(params);
  }

  async recordTap(
    userId: string,
    followersEarned: bigint,
    tapCount: number,
  ): Promise<Transaction> {
    return this.execute({
      userId,
      type: TransactionType.TAP,
      currency: CurrencyType.FOLLOWERS,
      amount: followersEarned,
      metadata: {
        tapCount,
        description: `Earned ${followersEarned.toString()} followers from ${tapCount} taps`,
      },
    });
  }

  async recordPassiveIncome(
    userId: string,
    followersEarned: bigint,
    hoursOffline: number,
  ): Promise<Transaction> {
    return this.execute({
      userId,
      type: TransactionType.PASSIVE,
      currency: CurrencyType.FOLLOWERS,
      amount: followersEarned,
      metadata: {
        hoursOffline,
        description: `Collected ${followersEarned.toString()} followers from ${hoursOffline.toFixed(1)} hours offline`,
      },
    });
  }

  async recordUpgradePurchase(
    userId: string,
    cost: bigint,
    upgradeId: string,
    upgradeName: string,
  ): Promise<Transaction> {
    return this.execute({
      userId,
      type: TransactionType.UPGRADE_PURCHASE,
      currency: CurrencyType.FOLLOWERS,
      amount: -cost, // Negative because it's a spend
      metadata: {
        upgradeId,
        upgradeName,
        description: `Purchased upgrade: ${upgradeName}`,
      },
    });
  }

  async recordMissionReward(
    userId: string,
    currency: CurrencyType,
    amount: bigint,
    missionId: string,
    missionTitle: string,
  ): Promise<Transaction> {
    return this.execute({
      userId,
      type: TransactionType.MISSION_REWARD,
      currency,
      amount,
      metadata: {
        missionId,
        missionTitle,
        description: `Mission reward: ${missionTitle}`,
      },
    });
  }

  async recordLevelUp(
    userId: string,
    gems: number,
    followers: bigint,
    levelFrom: number,
    levelTo: number,
  ): Promise<Transaction[]> {
    const transactions: Transaction[] = [];
    const metadata: TransactionMetadata = {
      levelFrom,
      levelTo,
      description: `Level up from ${levelFrom} to ${levelTo}`,
    };

    if (gems > 0) {
      const gemTransaction = await this.execute({
        userId,
        type: TransactionType.LEVEL_UP,
        currency: CurrencyType.GEMS,
        amount: BigInt(gems),
        metadata,
      });
      transactions.push(gemTransaction);
    }

    if (followers > BigInt(0)) {
      const followerTransaction = await this.execute({
        userId,
        type: TransactionType.LEVEL_UP,
        currency: CurrencyType.FOLLOWERS,
        amount: followers,
        metadata,
      });
      transactions.push(followerTransaction);
    }

    return transactions;
  }

  async recordReferralBonus(
    userId: string,
    followersEarned: bigint,
    referralId: string,
    referredUserId: string,
  ): Promise<Transaction> {
    return this.execute({
      userId,
      type: TransactionType.REFERRAL,
      currency: CurrencyType.FOLLOWERS,
      amount: followersEarned,
      metadata: {
        referralId,
        referredUserId,
        description: 'Referral bonus',
      },
    });
  }

  async recordSeasonReward(
    userId: string,
    gems: number,
    followers: bigint,
    tokensBz: number,
    seasonId: string,
    seasonName: string,
    rank: number,
  ): Promise<Transaction[]> {
    const transactions: Transaction[] = [];
    const metadata: TransactionMetadata = {
      seasonId,
      seasonName,
      description: `Season ${seasonName} reward - Rank #${rank}`,
    };

    if (gems > 0) {
      const gemTransaction = await this.execute({
        userId,
        type: TransactionType.SEASON_REWARD,
        currency: CurrencyType.GEMS,
        amount: BigInt(gems),
        metadata,
        seasonId,
      });
      transactions.push(gemTransaction);
    }

    if (followers > BigInt(0)) {
      const followerTransaction = await this.execute({
        userId,
        type: TransactionType.SEASON_REWARD,
        currency: CurrencyType.FOLLOWERS,
        amount: followers,
        metadata,
        seasonId,
      });
      transactions.push(followerTransaction);
    }

    if (tokensBz > 0) {
      const tokenTransaction = await this.execute({
        userId,
        type: TransactionType.SEASON_REWARD,
        currency: CurrencyType.TOKENS_BZ,
        amount: BigInt(Math.floor(tokensBz * 100)), // Store as cents
        metadata,
        seasonId,
      });
      transactions.push(tokenTransaction);
    }

    return transactions;
  }

  async recordTokenExchange(
    userId: string,
    gemsSpent: number,
    tokensReceived: number,
  ): Promise<Transaction[]> {
    const metadata: TransactionMetadata = {
      description: `Exchanged ${gemsSpent} gems for ${tokensReceived} BZ tokens`,
    };

    const gemTransaction = await this.execute({
      userId,
      type: TransactionType.TOKEN_EXCHANGE,
      currency: CurrencyType.GEMS,
      amount: BigInt(-gemsSpent),
      metadata,
    });

    const tokenTransaction = await this.execute({
      userId,
      type: TransactionType.TOKEN_EXCHANGE,
      currency: CurrencyType.TOKENS_BZ,
      amount: BigInt(Math.floor(tokensReceived * 100)),
      metadata,
    });

    return [gemTransaction, tokenTransaction];
  }
}
