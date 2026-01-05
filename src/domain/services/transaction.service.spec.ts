import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionService } from './transaction.service';
import {
  Transaction,
  TransactionType,
  CurrencyType,
} from '../entities/transaction.entity';
import { User } from '../entities/user.entity';

describe('TransactionService', () => {
  let service: TransactionService;
  let transactionRepository: jest.Mocked<Repository<Transaction>>;
  let userRepository: jest.Mocked<Repository<User>>;

  const mockUser: Partial<User> = {
    id: 'user-id',
    telegramId: 'telegram-123',
    followers: BigInt(10000),
    gems: 100,
    tokensBz: 50.5,
  };

  const mockTransaction: Partial<Transaction> = {
    id: 'tx-id',
    userId: 'user-id',
    type: TransactionType.TAP,
    currency: CurrencyType.FOLLOWERS,
    amount: BigInt(100),
    balanceBefore: BigInt(9900),
    balanceAfter: BigInt(10000),
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
    transactionRepository = module.get(getRepositoryToken(Transaction));
    userRepository = module.get(getRepositoryToken(User));
  });

  describe('createTransaction', () => {
    it('should create a transaction with correct balance tracking', async () => {
      userRepository.findOne.mockResolvedValue(mockUser as User);
      transactionRepository.create.mockReturnValue(
        mockTransaction as Transaction,
      );
      transactionRepository.save.mockResolvedValue(
        mockTransaction as Transaction,
      );

      const result = await service.createTransaction({
        userId: 'user-id',
        type: TransactionType.TAP,
        currency: CurrencyType.FOLLOWERS,
        amount: BigInt(100),
      });

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-id' },
      });
      expect(transactionRepository.create).toHaveBeenCalled();
      expect(transactionRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw error when user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createTransaction({
          userId: 'non-existent',
          type: TransactionType.TAP,
          currency: CurrencyType.FOLLOWERS,
          amount: BigInt(100),
        }),
      ).rejects.toThrow('User not found');
    });
  });

  describe('getTransactionHistory', () => {
    it('should return transactions with pagination', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockTransaction], 1]),
      };

      transactionRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      const result = await service.getTransactionHistory('user-id', {
        limit: 10,
        offset: 0,
      });

      expect(result.transactions).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should filter by transaction type', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      transactionRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      await service.getTransactionHistory('user-id', {
        type: TransactionType.TAP,
      });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'transaction.type = :type',
        { type: TransactionType.TAP },
      );
    });

    it('should filter by currency type', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      transactionRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      await service.getTransactionHistory('user-id', {
        currency: CurrencyType.GEMS,
      });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'transaction.currency = :currency',
        { currency: CurrencyType.GEMS },
      );
    });
  });

  describe('getTransactionSummary', () => {
    it('should calculate correct summary totals', async () => {
      const transactions = [
        { amount: BigInt(100), type: TransactionType.TAP },
        { amount: BigInt(50), type: TransactionType.PASSIVE },
        { amount: BigInt(-30), type: TransactionType.UPGRADE_PURCHASE },
      ];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(transactions),
      };

      transactionRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      const result = await service.getTransactionSummary(
        'user-id',
        CurrencyType.FOLLOWERS,
      );

      expect(result.totalEarned).toBe(BigInt(150)); // 100 + 50
      expect(result.totalSpent).toBe(BigInt(30)); // abs(-30)
      expect(result.netBalance).toBe(BigInt(120)); // 150 - 30
      expect(result.transactionCount).toBe(3);
    });

    it('should group totals by transaction type', async () => {
      const transactions = [
        { amount: BigInt(100), type: TransactionType.TAP },
        { amount: BigInt(200), type: TransactionType.TAP },
        { amount: BigInt(50), type: TransactionType.PASSIVE },
      ];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(transactions),
      };

      transactionRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      const result = await service.getTransactionSummary(
        'user-id',
        CurrencyType.FOLLOWERS,
      );

      expect(result.byType[TransactionType.TAP]).toBe(BigInt(300));
      expect(result.byType[TransactionType.PASSIVE]).toBe(BigInt(50));
    });
  });
});
