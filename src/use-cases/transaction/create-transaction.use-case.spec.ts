import { Test, TestingModule } from '@nestjs/testing';
import { CreateTransactionUseCase } from './create-transaction.use-case';
import { TransactionService } from '../../domain/services/transaction.service';
import {
  Transaction,
  TransactionType,
  CurrencyType,
} from '../../domain/entities/transaction.entity';

describe('CreateTransactionUseCase', () => {
  let useCase: CreateTransactionUseCase;
  let transactionService: jest.Mocked<TransactionService>;

  const mockTransaction: Partial<Transaction> = {
    id: 'tx-id',
    userId: 'user-id',
    type: TransactionType.TAP,
    currency: CurrencyType.FOLLOWERS,
    amount: BigInt(100),
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTransactionUseCase,
        {
          provide: TransactionService,
          useValue: {
            createTransaction: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<CreateTransactionUseCase>(CreateTransactionUseCase);
    transactionService = module.get(TransactionService);
  });

  describe('execute', () => {
    it('should create a transaction', async () => {
      transactionService.createTransaction.mockResolvedValue(
        mockTransaction as Transaction,
      );

      const result = await useCase.execute({
        userId: 'user-id',
        type: TransactionType.TAP,
        currency: CurrencyType.FOLLOWERS,
        amount: BigInt(100),
      });

      expect(result).toBeDefined();
      expect(transactionService.createTransaction).toHaveBeenCalled();
    });
  });

  describe('recordTap', () => {
    it('should create a tap transaction with correct metadata', async () => {
      transactionService.createTransaction.mockResolvedValue(
        mockTransaction as Transaction,
      );

      await useCase.recordTap('user-id', BigInt(100), 10);

      expect(transactionService.createTransaction).toHaveBeenCalledWith({
        userId: 'user-id',
        type: TransactionType.TAP,
        currency: CurrencyType.FOLLOWERS,
        amount: BigInt(100),
        metadata: {
          tapCount: 10,
          description: 'Earned 100 followers from 10 taps',
        },
      });
    });
  });

  describe('recordPassiveIncome', () => {
    it('should create a passive income transaction', async () => {
      transactionService.createTransaction.mockResolvedValue(
        mockTransaction as Transaction,
      );

      await useCase.recordPassiveIncome('user-id', BigInt(300), 3);

      expect(transactionService.createTransaction).toHaveBeenCalledWith({
        userId: 'user-id',
        type: TransactionType.PASSIVE,
        currency: CurrencyType.FOLLOWERS,
        amount: BigInt(300),
        metadata: {
          hoursOffline: 3,
          description: 'Collected 300 followers from 3.0 hours offline',
        },
      });
    });
  });

  describe('recordUpgradePurchase', () => {
    it('should create a negative transaction for upgrade purchase', async () => {
      transactionService.createTransaction.mockResolvedValue(
        mockTransaction as Transaction,
      );

      await useCase.recordUpgradePurchase(
        'user-id',
        BigInt(1000),
        'upgrade-1',
        'Fast Car',
      );

      expect(transactionService.createTransaction).toHaveBeenCalledWith({
        userId: 'user-id',
        type: TransactionType.UPGRADE_PURCHASE,
        currency: CurrencyType.FOLLOWERS,
        amount: BigInt(-1000),
        metadata: {
          upgradeId: 'upgrade-1',
          upgradeName: 'Fast Car',
          description: 'Purchased upgrade: Fast Car',
        },
      });
    });
  });

  describe('recordMissionReward', () => {
    it('should create a mission reward transaction', async () => {
      transactionService.createTransaction.mockResolvedValue(
        mockTransaction as Transaction,
      );

      await useCase.recordMissionReward(
        'user-id',
        CurrencyType.GEMS,
        BigInt(50),
        'mission-1',
        'Daily Taps',
      );

      expect(transactionService.createTransaction).toHaveBeenCalledWith({
        userId: 'user-id',
        type: TransactionType.MISSION_REWARD,
        currency: CurrencyType.GEMS,
        amount: BigInt(50),
        metadata: {
          missionId: 'mission-1',
          missionTitle: 'Daily Taps',
          description: 'Mission reward: Daily Taps',
        },
      });
    });
  });

  describe('recordLevelUp', () => {
    it('should create transactions for gems and followers', async () => {
      transactionService.createTransaction.mockResolvedValue(
        mockTransaction as Transaction,
      );

      const result = await useCase.recordLevelUp(
        'user-id',
        10,
        BigInt(1000),
        1,
        2,
      );

      expect(result).toHaveLength(2);
      expect(transactionService.createTransaction).toHaveBeenCalledTimes(2);
    });

    it('should only create gem transaction when followers are 0', async () => {
      transactionService.createTransaction.mockResolvedValue(
        mockTransaction as Transaction,
      );

      const result = await useCase.recordLevelUp(
        'user-id',
        10,
        BigInt(0),
        1,
        2,
      );

      expect(result).toHaveLength(1);
    });

    it('should only create follower transaction when gems are 0', async () => {
      transactionService.createTransaction.mockResolvedValue(
        mockTransaction as Transaction,
      );

      const result = await useCase.recordLevelUp(
        'user-id',
        0,
        BigInt(1000),
        1,
        2,
      );

      expect(result).toHaveLength(1);
    });
  });

  describe('recordReferralBonus', () => {
    it('should create a referral bonus transaction', async () => {
      transactionService.createTransaction.mockResolvedValue(
        mockTransaction as Transaction,
      );

      await useCase.recordReferralBonus(
        'user-id',
        BigInt(1000),
        'ref-1',
        'referred-user',
      );

      expect(transactionService.createTransaction).toHaveBeenCalledWith({
        userId: 'user-id',
        type: TransactionType.REFERRAL,
        currency: CurrencyType.FOLLOWERS,
        amount: BigInt(1000),
        metadata: {
          referralId: 'ref-1',
          referredUserId: 'referred-user',
          description: 'Referral bonus',
        },
      });
    });
  });

  describe('recordSeasonReward', () => {
    it('should create transactions for all reward types', async () => {
      transactionService.createTransaction.mockResolvedValue(
        mockTransaction as Transaction,
      );

      const result = await useCase.recordSeasonReward(
        'user-id',
        100,
        BigInt(10000),
        50,
        'season-1',
        'Season 1',
        1,
      );

      expect(result).toHaveLength(3); // gems, followers, tokens
      expect(transactionService.createTransaction).toHaveBeenCalledTimes(3);
    });
  });

  describe('recordTokenExchange', () => {
    it('should create two transactions for gem to token exchange', async () => {
      transactionService.createTransaction.mockResolvedValue(
        mockTransaction as Transaction,
      );

      const result = await useCase.recordTokenExchange('user-id', 100, 10);

      expect(result).toHaveLength(2);

      // First call should be negative gems
      expect(transactionService.createTransaction).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          type: TransactionType.TOKEN_EXCHANGE,
          currency: CurrencyType.GEMS,
          amount: BigInt(-100),
        }),
      );

      // Second call should be positive tokens
      expect(transactionService.createTransaction).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          type: TransactionType.TOKEN_EXCHANGE,
          currency: CurrencyType.TOKENS_BZ,
          amount: BigInt(1000), // 10 * 100 (stored as cents)
        }),
      );
    });
  });
});
