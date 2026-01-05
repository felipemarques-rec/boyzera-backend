import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetCurrentSeasonUseCase } from './get-current-season.use-case';
import { Season, SeasonStatus } from '../../domain/entities/season.entity';

describe('GetCurrentSeasonUseCase', () => {
  let useCase: GetCurrentSeasonUseCase;
  let seasonRepository: jest.Mocked<Repository<Season>>;

  const createMockSeason = (overrides: Partial<Season> = {}): Season => {
    const season = new Season();
    season.id = 'season-1';
    season.name = 'Season 1';
    season.status = SeasonStatus.ACTIVE;
    season.startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    season.endDate = new Date(Date.now() + 23 * 24 * 60 * 60 * 1000);
    season.seasonNumber = 1;
    season.prizePool = {
      totalGems: 10000,
      totalTokensBz: 1000,
      tiers: [],
    };
    season.rewardsDistributed = false;
    return Object.assign(season, overrides);
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCurrentSeasonUseCase,
        {
          provide: getRepositoryToken(Season),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<GetCurrentSeasonUseCase>(GetCurrentSeasonUseCase);
    seasonRepository = module.get(getRepositoryToken(Season));
  });

  describe('execute', () => {
    it('should return active season with progress info', async () => {
      const mockSeason = createMockSeason();
      seasonRepository.findOne.mockResolvedValueOnce(mockSeason);

      const result = await useCase.execute();

      expect(result).not.toBeNull();
      expect(result?.season).toBeDefined();
      expect(result?.isActive).toBe(true);
      expect(result?.daysRemaining).toBeGreaterThan(0);
      expect(result?.progressPercentage).toBeGreaterThan(0);
    });

    it('should return upcoming season when no active season', async () => {
      const upcomingSeason = createMockSeason({
        status: SeasonStatus.UPCOMING,
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      seasonRepository.findOne
        .mockResolvedValueOnce(null) // No active season
        .mockResolvedValueOnce(upcomingSeason); // Upcoming season

      const result = await useCase.execute();

      expect(result).not.toBeNull();
      expect(result?.isActive).toBe(false);
    });

    it('should return null when no active or upcoming season', async () => {
      seasonRepository.findOne.mockResolvedValue(null);

      const result = await useCase.execute();

      expect(result).toBeNull();
    });
  });

  describe('getAllSeasons', () => {
    it('should return all seasons ordered by seasonNumber', async () => {
      const seasons = [
        createMockSeason({ seasonNumber: 2 }),
        createMockSeason({ seasonNumber: 1 }),
      ];
      seasonRepository.find.mockResolvedValue(seasons);

      const result = await useCase.getAllSeasons();

      expect(result).toHaveLength(2);
      expect(seasonRepository.find).toHaveBeenCalledWith({
        order: { seasonNumber: 'DESC' },
      });
    });
  });

  describe('getSeasonById', () => {
    it('should return season by id', async () => {
      const season = createMockSeason();
      seasonRepository.findOne.mockResolvedValue(season);

      const result = await useCase.getSeasonById('season-1');

      expect(result).toBeDefined();
      expect(result?.id).toBe('season-1');
    });

    it('should return null when season not found', async () => {
      seasonRepository.findOne.mockResolvedValue(null);

      const result = await useCase.getSeasonById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('getSeasonHistory', () => {
    it('should return only ended seasons', async () => {
      const endedSeasons = [createMockSeason({ status: SeasonStatus.ENDED })];
      seasonRepository.find.mockResolvedValue(endedSeasons);

      const result = await useCase.getSeasonHistory();

      expect(seasonRepository.find).toHaveBeenCalledWith({
        where: { status: SeasonStatus.ENDED },
        order: { endDate: 'DESC' },
      });
      expect(result).toHaveLength(1);
    });
  });
});
