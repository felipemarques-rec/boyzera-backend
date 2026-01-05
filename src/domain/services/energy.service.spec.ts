import { Test, TestingModule } from '@nestjs/testing';
import { EnergyService } from './energy.service';
import { User } from '../entities/user.entity';

describe('EnergyService', () => {
  let service: EnergyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EnergyService],
    }).compile();

    service = module.get<EnergyService>(EnergyService);
  });

  describe('calculateCurrentEnergy', () => {
    it('should return max energy when enough time has passed', () => {
      const user = createMockUser({
        energy: 0,
        maxEnergy: 1000,
        energyRegenRate: 1,
        lastEnergyUpdate: new Date(Date.now() - 2000 * 1000), // 2000 seconds ago
      });

      const result = service.calculateCurrentEnergy(user);

      expect(result.currentEnergy).toBe(1000);
      expect(result.secondsUntilFull).toBe(0);
    });

    it('should calculate partial regeneration correctly', () => {
      const user = createMockUser({
        energy: 500,
        maxEnergy: 1000,
        energyRegenRate: 1,
        lastEnergyUpdate: new Date(Date.now() - 100 * 1000), // 100 seconds ago
      });

      const result = service.calculateCurrentEnergy(user);

      expect(result.currentEnergy).toBe(600);
      expect(result.secondsUntilFull).toBe(400);
    });

    it('should handle no regeneration when energy is full', () => {
      const user = createMockUser({
        energy: 1000,
        maxEnergy: 1000,
        energyRegenRate: 1,
        lastEnergyUpdate: new Date(Date.now() - 100 * 1000),
      });

      const result = service.calculateCurrentEnergy(user);

      expect(result.currentEnergy).toBe(1000);
      expect(result.secondsUntilFull).toBe(0);
    });

    it('should respect energy regen rate', () => {
      const user = createMockUser({
        energy: 0,
        maxEnergy: 1000,
        energyRegenRate: 2, // 2 energy per second
        lastEnergyUpdate: new Date(Date.now() - 100 * 1000),
      });

      const result = service.calculateCurrentEnergy(user);

      expect(result.currentEnergy).toBe(200);
    });
  });

  describe('canTap', () => {
    it('should return true when enough energy', () => {
      const user = createMockUser({
        energy: 100,
        maxEnergy: 1000,
        energyRegenRate: 1,
        lastEnergyUpdate: new Date(),
      });

      expect(service.canTap(user, 50)).toBe(true);
    });

    it('should return false when not enough energy', () => {
      const user = createMockUser({
        energy: 10,
        maxEnergy: 1000,
        energyRegenRate: 1,
        lastEnergyUpdate: new Date(),
      });

      expect(service.canTap(user, 50)).toBe(false);
    });
  });

  describe('consumeEnergy', () => {
    it('should consume energy correctly', () => {
      const user = createMockUser({
        energy: 100,
        maxEnergy: 1000,
        energyRegenRate: 1,
        lastEnergyUpdate: new Date(),
      });

      const result = service.consumeEnergy(user, 50);

      expect(result.newEnergy).toBe(50);
    });

    it('should not go below zero', () => {
      const user = createMockUser({
        energy: 10,
        maxEnergy: 1000,
        energyRegenRate: 1,
        lastEnergyUpdate: new Date(),
      });

      const result = service.consumeEnergy(user, 50);

      expect(result.newEnergy).toBe(0);
    });
  });

  describe('getRegenTimeForEnergy', () => {
    it('should calculate time correctly', () => {
      const user = createMockUser({
        energy: 0,
        maxEnergy: 1000,
        energyRegenRate: 1,
      });

      const result = service.getRegenTimeForEnergy(user, 100);

      expect(result.seconds).toBe(100);
      expect(result.readableTime).toBe('1m 40s');
    });

    it('should format hours correctly', () => {
      const user = createMockUser({
        energy: 0,
        maxEnergy: 1000,
        energyRegenRate: 1,
      });

      const result = service.getRegenTimeForEnergy(user, 3700);

      expect(result.seconds).toBe(3700);
      expect(result.readableTime).toBe('1h 1m 40s');
    });
  });
});

function createMockUser(overrides: Partial<User> = {}): User {
  const user = new User();
  user.id = 'test-id';
  user.telegramId = 'telegram-123';
  user.followers = BigInt(0);
  user.energy = 1000;
  user.maxEnergy = 1000;
  user.energyRegenRate = 1;
  user.lastEnergyUpdate = new Date();
  user.createdAt = new Date();
  user.level = 1;
  user.tapMultiplier = 1;
  user.profitPerHour = 0;
  user.gems = 0;
  user.tokensBz = 0;
  user.totalTaps = BigInt(0);
  user.combo = 0;
  user.isBanned = false;

  return Object.assign(user, overrides);
}
