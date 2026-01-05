import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PassiveIncomeService } from './passive-income.service';
import { User } from '../entities/user.entity';

describe('PassiveIncomeService', () => {
  let service: PassiveIncomeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PassiveIncomeService,
        {
          provide: ConfigService,
          useValue: {
            get: jest
              .fn()
              .mockImplementation((key: string, defaultValue: any) => {
                if (key === 'OFFLINE_MAX_HOURS') return 3;
                return defaultValue;
              }),
          },
        },
      ],
    }).compile();

    service = module.get<PassiveIncomeService>(PassiveIncomeService);
  });

  describe('calculatePassiveIncome', () => {
    it('should return 0 when profit per hour is 0', () => {
      const user = createMockUser({ profitPerHour: 0 });

      const result = service.calculatePassiveIncome(user);

      expect(result.earnedFollowers).toBe(BigInt(0));
      expect(result.wasCollected).toBe(false);
    });

    it('should calculate income for 1 hour offline', () => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const user = createMockUser({
        profitPerHour: 100,
        lastLoginAt: oneHourAgo,
      });

      const result = service.calculatePassiveIncome(user);

      expect(result.earnedFollowers).toBe(BigInt(100));
      expect(result.cappedHours).toBeCloseTo(1, 0);
      expect(result.wasCollected).toBe(true);
    });

    it('should cap income at max offline hours', () => {
      const tenHoursAgo = new Date(Date.now() - 10 * 60 * 60 * 1000);
      const user = createMockUser({
        profitPerHour: 100,
        lastLoginAt: tenHoursAgo,
      });

      const result = service.calculatePassiveIncome(user);

      // Max 3 hours * 100 = 300
      expect(result.earnedFollowers).toBe(BigInt(300));
      expect(result.cappedHours).toBe(3);
      expect(result.hoursOffline).toBeCloseTo(10, 0);
    });

    it('should use createdAt when lastLoginAt is undefined', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      const user = createMockUser({
        profitPerHour: 50,
        lastLoginAt: undefined,
        createdAt: twoHoursAgo,
      });

      const result = service.calculatePassiveIncome(user);

      expect(result.earnedFollowers).toBe(BigInt(100)); // 2 * 50
    });
  });

  describe('getPotentialEarnings', () => {
    it('should calculate potential earnings correctly', () => {
      const user = createMockUser({ profitPerHour: 100 });

      const result = service.getPotentialEarnings(user, 2);

      expect(result).toBe(BigInt(200));
    });

    it('should cap at max offline hours', () => {
      const user = createMockUser({ profitPerHour: 100 });

      const result = service.getPotentialEarnings(user, 10);

      expect(result).toBe(BigInt(300)); // Capped at 3 hours
    });
  });

  describe('formatEarnings', () => {
    it('should format thousands correctly', () => {
      expect(service.formatEarnings(BigInt(1500))).toBe('1.5K');
    });

    it('should format millions correctly', () => {
      expect(service.formatEarnings(BigInt(2500000))).toBe('2.5M');
    });

    it('should format billions correctly', () => {
      expect(service.formatEarnings(BigInt(1500000000))).toBe('1.5B');
    });

    it('should format small numbers without suffix', () => {
      expect(service.formatEarnings(BigInt(500))).toBe('500');
    });
  });

  describe('getMaxOfflineHours', () => {
    it('should return configured max offline hours', () => {
      expect(service.getMaxOfflineHours()).toBe(3);
    });
  });
});

function createMockUser(overrides: Partial<User> = {}): User {
  const user = new User();
  user.id = 'test-id';
  user.telegramId = 'telegram-123';
  user.followers = BigInt(0);
  user.level = 1;
  user.energy = 1000;
  user.maxEnergy = 1000;
  user.energyRegenRate = 1;
  user.profitPerHour = 0;
  user.lastLoginAt = new Date();
  user.createdAt = new Date();
  user.tapMultiplier = 1;
  user.gems = 0;
  user.tokensBz = 0;
  user.totalTaps = BigInt(0);
  user.combo = 0;
  user.isBanned = false;

  return Object.assign(user, overrides);
}
