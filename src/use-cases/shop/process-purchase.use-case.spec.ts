import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import { ProcessPurchaseUseCase } from './process-purchase.use-case';
import {
  Product,
  ProductType,
  ProductCurrency,
  BoosterType,
} from '../../domain/entities/product.entity';
import {
  Purchase,
  PurchaseStatus,
} from '../../domain/entities/purchase.entity';
import { User } from '../../domain/entities/user.entity';
import { UserBooster } from '../../domain/entities/user-booster.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('ProcessPurchaseUseCase', () => {
  let useCase: ProcessPurchaseUseCase;
  let productRepository: jest.Mocked<Repository<Product>>;
  let purchaseRepository: jest.Mocked<Repository<Purchase>>;
  let userRepository: jest.Mocked<Repository<User>>;
  let userBoosterRepository: jest.Mocked<Repository<UserBooster>>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  const mockUser: Partial<User> = {
    id: 'user-id',
    telegramId: 'telegram-123',
    followers: BigInt(10000),
    gems: 100,
    energy: 500,
    maxEnergy: 1000,
    isBanned: false,
  };

  const mockProduct: Partial<Product> = {
    id: 'product-id',
    name: 'Gem Pack',
    type: ProductType.GEMS,
    currency: ProductCurrency.STARS,
    price: 100,
    isActive: true,
    reward: { gems: 500 },
    purchaseCount: 0,
    isAvailable: jest.fn().mockReturnValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessPurchaseUseCase,
        {
          provide: getRepositoryToken(Product),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Purchase),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            count: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserBooster),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<ProcessPurchaseUseCase>(ProcessPurchaseUseCase);
    productRepository = module.get(getRepositoryToken(Product));
    purchaseRepository = module.get(getRepositoryToken(Purchase));
    userRepository = module.get(getRepositoryToken(User));
    userBoosterRepository = module.get(getRepositoryToken(UserBooster));
    eventEmitter = module.get(EventEmitter2);
  });

  describe('execute', () => {
    it('should process purchase successfully', async () => {
      userRepository.findOne.mockResolvedValue(mockUser as User);
      productRepository.findOne.mockResolvedValue(mockProduct as Product);
      purchaseRepository.create.mockReturnValue({
        id: 'purchase-id',
        status: PurchaseStatus.COMPLETED,
      } as Purchase);
      purchaseRepository.save.mockResolvedValue({
        id: 'purchase-id',
        status: PurchaseStatus.COMPLETED,
      } as Purchase);

      const result = await useCase.execute({
        userId: 'user-id',
        productId: 'product-id',
      });

      expect(result.purchase).toBeDefined();
      expect(result.reward.gems).toBe(500);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'purchase.completed',
        expect.any(Object),
      );
    });

    it('should throw when user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        useCase.execute({
          userId: 'non-existent',
          productId: 'product-id',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw when user is banned', async () => {
      userRepository.findOne.mockResolvedValue({
        ...mockUser,
        isBanned: true,
      } as User);

      await expect(
        useCase.execute({
          userId: 'user-id',
          productId: 'product-id',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when product not found', async () => {
      userRepository.findOne.mockResolvedValue(mockUser as User);
      productRepository.findOne.mockResolvedValue(null);

      await expect(
        useCase.execute({
          userId: 'user-id',
          productId: 'non-existent',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw when product not available', async () => {
      userRepository.findOne.mockResolvedValue(mockUser as User);
      productRepository.findOne.mockResolvedValue({
        ...mockProduct,
        isAvailable: jest.fn().mockReturnValue(false),
      } as any);

      await expect(
        useCase.execute({
          userId: 'user-id',
          productId: 'product-id',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when insufficient gems for gem purchase', async () => {
      userRepository.findOne.mockResolvedValue({
        ...mockUser,
        gems: 10,
      } as User);
      productRepository.findOne.mockResolvedValue({
        ...mockProduct,
        currency: ProductCurrency.GEMS,
        price: 100,
      } as any);

      await expect(
        useCase.execute({
          userId: 'user-id',
          productId: 'product-id',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should deduct gems for gem purchase', async () => {
      const user = { ...mockUser, gems: 200 } as User;
      userRepository.findOne.mockResolvedValue(user);
      productRepository.findOne.mockResolvedValue({
        ...mockProduct,
        currency: ProductCurrency.GEMS,
        price: 50,
        reward: { followers: '1000' },
      } as any);
      purchaseRepository.create.mockReturnValue({
        id: 'purchase-id',
      } as Purchase);
      purchaseRepository.save.mockResolvedValue({
        id: 'purchase-id',
      } as Purchase);

      await useCase.execute({
        userId: 'user-id',
        productId: 'product-id',
      });

      expect(userRepository.save).toHaveBeenCalled();
    });
  });

  describe('getUserBoosters', () => {
    it('should return active boosters', async () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 2);

      const mockBooster = {
        id: 'booster-id',
        boosterType: BoosterType.TAP_MULTIPLIER,
        multiplier: 2,
        expiresAt: futureDate,
        isActive: true,
        isExpired: () => false,
      };

      userBoosterRepository.find.mockResolvedValue([mockBooster] as any);

      const result = await useCase.getUserBoosters('user-id');

      expect(result).toHaveLength(1);
    });

    it('should filter out expired boosters', async () => {
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 2);

      const mockBooster = {
        id: 'booster-id',
        boosterType: BoosterType.TAP_MULTIPLIER,
        multiplier: 2,
        expiresAt: pastDate,
        isActive: true,
        isExpired: () => true,
      };

      userBoosterRepository.find.mockResolvedValue([mockBooster] as any);

      const result = await useCase.getUserBoosters('user-id');

      expect(result).toHaveLength(0);
    });
  });

  describe('getActiveBoosterMultiplier', () => {
    it('should return multiplier for active booster', async () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 2);

      userBoosterRepository.findOne.mockResolvedValue({
        multiplier: 2,
        isExpired: () => false,
      } as any);

      const result = await useCase.getActiveBoosterMultiplier(
        'user-id',
        BoosterType.TAP_MULTIPLIER,
      );

      expect(result).toBe(2);
    });

    it('should return 1 when no active booster', async () => {
      userBoosterRepository.findOne.mockResolvedValue(null);

      const result = await useCase.getActiveBoosterMultiplier(
        'user-id',
        BoosterType.TAP_MULTIPLIER,
      );

      expect(result).toBe(1);
    });
  });
});
