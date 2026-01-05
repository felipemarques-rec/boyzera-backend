import { Season, SeasonStatus, SeasonPrizePool } from './season.entity';

describe('Season Entity', () => {
  let season: Season;

  const createSeason = (overrides: Partial<Season> = {}): Season => {
    const s = new Season();
    s.id = 'test-season-id';
    s.name = 'Season 1';
    s.description = 'First season';
    s.status = SeasonStatus.ACTIVE;
    s.startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
    s.endDate = new Date(Date.now() + 23 * 24 * 60 * 60 * 1000); // 23 days from now
    s.seasonNumber = 1;
    s.prizePool = {
      totalGems: 10000,
      totalTokensBz: 1000,
      tiers: [
        {
          rank: 1,
          gems: 1000,
          followers: '100000',
          tokensBz: 100,
          title: 'Champion',
        },
        { rank: 2, gems: 500, followers: '50000', tokensBz: 50 },
        { rank: 3, gems: 250, followers: '25000', tokensBz: 25 },
      ],
    };
    s.rewardsDistributed = false;
    s.createdAt = new Date();
    s.updatedAt = new Date();

    return Object.assign(s, overrides);
  };

  beforeEach(() => {
    season = createSeason();
  });

  describe('isActive', () => {
    it('should return true when season is active and within date range', () => {
      expect(season.isActive()).toBe(true);
    });

    it('should return false when status is not ACTIVE', () => {
      season.status = SeasonStatus.UPCOMING;
      expect(season.isActive()).toBe(false);
    });

    it('should return false when current date is before start date', () => {
      season.startDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
      expect(season.isActive()).toBe(false);
    });

    it('should return false when current date is after end date', () => {
      season.endDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // Yesterday
      expect(season.isActive()).toBe(false);
    });
  });

  describe('isUpcoming', () => {
    it('should return true when status is UPCOMING and start date is in future', () => {
      season.status = SeasonStatus.UPCOMING;
      season.startDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      expect(season.isUpcoming()).toBe(true);
    });

    it('should return false when status is not UPCOMING', () => {
      season.status = SeasonStatus.ACTIVE;
      season.startDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      expect(season.isUpcoming()).toBe(false);
    });

    it('should return false when start date has passed', () => {
      season.status = SeasonStatus.UPCOMING;
      season.startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      expect(season.isUpcoming()).toBe(false);
    });
  });

  describe('hasEnded', () => {
    it('should return true when status is ENDED', () => {
      season.status = SeasonStatus.ENDED;
      expect(season.hasEnded()).toBe(true);
    });

    it('should return true when end date has passed', () => {
      season.endDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      expect(season.hasEnded()).toBe(true);
    });

    it('should return false when season is active and end date is in future', () => {
      expect(season.hasEnded()).toBe(false);
    });
  });

  describe('getDaysRemaining', () => {
    it('should return correct days remaining', () => {
      const daysRemaining = season.getDaysRemaining();
      expect(daysRemaining).toBeGreaterThanOrEqual(22);
      expect(daysRemaining).toBeLessThanOrEqual(24);
    });

    it('should return 0 when season has ended', () => {
      season.endDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      expect(season.getDaysRemaining()).toBe(0);
    });
  });

  describe('getProgressPercentage', () => {
    it('should return 0 when season has not started', () => {
      season.startDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      expect(season.getProgressPercentage()).toBe(0);
    });

    it('should return 100 when season has ended', () => {
      season.endDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      expect(season.getProgressPercentage()).toBe(100);
    });

    it('should return correct percentage during season', () => {
      // Season is 30 days total, 7 days elapsed
      const progress = season.getProgressPercentage();
      expect(progress).toBeGreaterThan(0);
      expect(progress).toBeLessThan(100);
    });
  });

  describe('prize pool structure', () => {
    it('should have valid prize pool with tiers', () => {
      expect(season.prizePool.totalGems).toBe(10000);
      expect(season.prizePool.totalTokensBz).toBe(1000);
      expect(season.prizePool.tiers).toHaveLength(3);
    });

    it('should have first place with title', () => {
      const firstPlace = season.prizePool.tiers[0];
      expect(firstPlace.rank).toBe(1);
      expect(firstPlace.title).toBe('Champion');
    });
  });
});
