import { TransactionService, CreateTransactionParams } from '../../domain/services/transaction.service';
import { Transaction, CurrencyType } from '../../domain/entities/transaction.entity';
export declare class CreateTransactionUseCase {
    private transactionService;
    constructor(transactionService: TransactionService);
    execute(params: CreateTransactionParams): Promise<Transaction>;
    recordTap(userId: string, followersEarned: bigint, tapCount: number): Promise<Transaction>;
    recordPassiveIncome(userId: string, followersEarned: bigint, hoursOffline: number): Promise<Transaction>;
    recordUpgradePurchase(userId: string, cost: bigint, upgradeId: string, upgradeName: string): Promise<Transaction>;
    recordMissionReward(userId: string, currency: CurrencyType, amount: bigint, missionId: string, missionTitle: string): Promise<Transaction>;
    recordLevelUp(userId: string, gems: number, followers: bigint, levelFrom: number, levelTo: number): Promise<Transaction[]>;
    recordReferralBonus(userId: string, followersEarned: bigint, referralId: string, referredUserId: string): Promise<Transaction>;
    recordSeasonReward(userId: string, gems: number, followers: bigint, tokensBz: number, seasonId: string, seasonName: string, rank: number): Promise<Transaction[]>;
    recordTokenExchange(userId: string, gemsSpent: number, tokensReceived: number): Promise<Transaction[]>;
}
