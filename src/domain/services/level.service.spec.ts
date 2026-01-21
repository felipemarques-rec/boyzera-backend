import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LevelService } from './level.service';
import { Level } from '../entities/level.entity';
import { User } from '../entities/user.entity';

describe('LevelService', () => {
  let service: LevelService;
  let levelRepository: Repository<Level>;

  const mockLevels: Level[] = [
    createMockLevel(1, 'Zé Ninguém', BigInt(0), 1000, 1),
    createMockLevel(2, 'Microcelebridade do Bairro', BigInt(5000), 1100, 2),
    createMockLevel(3, 'Trend do Instagram', BigInt(50000), 1200, 3),
    createMockLevel(4, 'Dono do Hype', BigInt(250000), 1350, 4),
    createMockLevel(5, 'Fenômeno da Internet', BigInt(1000000), 1500, 5),
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LevelService,
        {
          provide: getRepositoryToken(Level),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<LevelService>(LevelService);
    levelRepository = module.get<Repository<Level>>(getRepositoryToken(Level));
  });

  describe('getAllLevels', () => {
    it('should return all levels ordered by value', async () => {
      jest.spyOn(levelRepository, 'find').mockResolvedValue(mockLevels);

      const result = await service.getAllLevels();

      expect(result).toEqual(mockLevels);
      expect(levelRepository.find).toHaveBeenCalledWith({
        order: { value: 'ASC' },
      });
    });
  });

  describe('getLevelByValue', () => {
    it('should return level by value', async () => {
      jest.spyOn(levelRepository, 'findOne').mockResolvedValue(mockLevels[0]);

      const result = await service.getLevelByValue(1);

      expect(result).toEqual(mockLevels[0]);
    });
  });

  describe('calculateLevel', () => {
    it('should return level 1 for 0 followers', async () => {
      jest.spyOn(levelRepository, 'findOne').mockResolvedValue(mockLevels[0]);

      const result = await service.calculateLevel(BigInt(0));

      expect(result.value).toBe(1);
    });

    it('should return correct level for followers threshold', async () => {
      jest.spyOn(levelRepository, 'findOne').mockResolvedValue(mockLevels[2]);

      const result = await service.calculateLevel(BigInt(5000));

      expect(result.value).toBe(3);
    });
  });

  describe('checkLevelUp', () => {
    it('should detect level up when followers exceed threshold', async () => {
      const user = createMockUser({ level: 1, followers: BigInt(6000) });

      jest.spyOn(levelRepository, 'findOne').mockResolvedValue(mockLevels[1]);
      jest.spyOn(levelRepository, 'find').mockResolvedValue([mockLevels[1]]);

      const result = await service.checkLevelUp(user);

      expect(result.leveledUp).toBe(true);
      expect(result.newLevel).toBe(2);
      expect(result.rewards).toBeDefined();
    });

    it('should not level up when under threshold', async () => {
      const user = createMockUser({ level: 1, followers: BigInt(3000) });

      jest.spyOn(levelRepository, 'findOne').mockResolvedValue(mockLevels[0]);

      const result = await service.checkLevelUp(user);

      expect(result.leveledUp).toBe(false);
      expect(result.newLevel).toBe(1);
      expect(result.rewards).toBeNull();
    });
  });

  describe('getProgressToNextLevel', () => {
    it('should calculate progress correctly', async () => {
      // User at level 1 with 2500 followers (50% progress to level 2)
      const user = createMockUser({ level: 1, followers: BigInt(2500) });

      jest
        .spyOn(levelRepository, 'findOne')
        .mockResolvedValueOnce(mockLevels[0]) // level 1: 0 followers
        .mockResolvedValueOnce(mockLevels[1]); // level 2: 5000 followers

      const result = await service.getProgressToNextLevel(user);

      // current = 2500 - 0 = 2500
      // required = 5000 - 0 = 5000
      // percentage = 2500 / 5000 * 100 = 50%
      expect(result.current).toBe(BigInt(2500));
      expect(result.required).toBe(BigInt(5000));
      expect(result.percentage).toBe(50);
    });

    it('should reset progress when user levels up', async () => {
      // User just reached level 2 with 6000 followers
      const user = createMockUser({ level: 2, followers: BigInt(6000) });

      jest
        .spyOn(levelRepository, 'findOne')
        .mockResolvedValueOnce(mockLevels[1]) // level 2: 5000 followers
        .mockResolvedValueOnce(mockLevels[2]); // level 3: 50000 followers

      const result = await service.getProgressToNextLevel(user);

      // current = 6000 - 5000 = 1000 (progress resets!)
      // required = 50000 - 5000 = 45000
      // percentage = 1000 / 45000 * 100 = ~2.2%
      expect(result.current).toBe(BigInt(1000));
      expect(result.required).toBe(BigInt(45000));
      expect(result.percentage).toBe(2);
    });

    it('should return 100% for max level', async () => {
      const user = createMockUser({
        level: 100,
        followers: BigInt(1000000000000),
      });

      jest
        .spyOn(levelRepository, 'findOne')
        .mockResolvedValueOnce(mockLevels[4])
        .mockResolvedValueOnce(null);

      const result = await service.getProgressToNextLevel(user);

      expect(result.percentage).toBe(100);
    });
  });
});

function createMockLevel(
  value: number,
  name: string,
  requiredFollowers: bigint,
  maxEnergy: number,
  tapMultiplier: number,
): Level {
  const level = new Level();
  level.value = value;
  level.name = name;
  level.requiredFollowers = requiredFollowers;
  level.maxEnergy = maxEnergy;
  level.energyRegenRate = 1;
  level.tapMultiplier = tapMultiplier;
  level.rewardGems = value * 10;
  level.rewardFollowers = BigInt(value * 100);
  return level;
}

function createMockUser(overrides: Partial<User> = {}): User {
  const user = new User();
  user.id = 'test-id';
  user.telegramId = 'telegram-123';
  user.followers = BigInt(0);
  user.level = 1;
  user.energy = 1000;
  user.maxEnergy = 1000;
  user.energyRegenRate = 1;
  user.createdAt = new Date();
  user.tapMultiplier = 1;
  user.profitPerHour = 0;
  user.gems = 0;
  user.tokensBz = 0;
  user.totalTaps = BigInt(0);
  user.combo = 0;
  user.isBanned = false;

  return Object.assign(user, overrides);
}
