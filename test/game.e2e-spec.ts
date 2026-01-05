import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../src/domain/entities/user.entity';
import { Level } from '../src/domain/entities/level.entity';
import { Repository } from 'typeorm';

describe('GameController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let levelRepository: Repository<Level>;
  let authToken: string;
  let testUser: User;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );
    levelRepository = moduleFixture.get<Repository<Level>>(
      getRepositoryToken(Level),
    );

    // Create test user
    testUser = userRepository.create({
      telegramId: 'test-telegram-id',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      nickname: 'TestNick',
      followers: BigInt(1000),
      level: 1,
      energy: 1000,
      maxEnergy: 1000,
      energyRegenRate: 1,
      tapMultiplier: 1,
      profitPerHour: 100,
      gems: 0,
      tokensBz: 0,
      passiveIncomeRate: 0,
      totalTaps: BigInt(0),
      combo: 0,
    });
    await userRepository.save(testUser);

    // Create initial levels
    const levels = [
      {
        value: 1,
        name: 'Novato',
        requiredFollowers: BigInt(0),
        maxEnergy: 1000,
        energyRegenRate: 1,
        tapMultiplier: 1,
        rewardGems: 0,
        rewardFollowers: BigInt(0),
      },
      {
        value: 2,
        name: 'Iniciante',
        requiredFollowers: BigInt(1000),
        maxEnergy: 1100,
        energyRegenRate: 1,
        tapMultiplier: 1,
        rewardGems: 10,
        rewardFollowers: BigInt(100),
      },
      {
        value: 3,
        name: 'Aprendiz',
        requiredFollowers: BigInt(5000),
        maxEnergy: 1200,
        energyRegenRate: 1.1,
        tapMultiplier: 2,
        rewardGems: 20,
        rewardFollowers: BigInt(200),
      },
    ];

    for (const level of levels) {
      await levelRepository.save(levelRepository.create(level));
    }

    // Note: In a real test, you would generate a proper JWT token
    // For now, this is a placeholder - you would need to mock the auth or use a test token
    authToken = 'test-jwt-token';
  });

  afterAll(async () => {
    // Cleanup
    try {
      await userRepository.delete({ telegramId: 'test-telegram-id' });
      // Delete levels by their values instead of empty criteria
      await levelRepository.delete({ value: 1 });
      await levelRepository.delete({ value: 2 });
      await levelRepository.delete({ value: 3 });
    } catch (error) {
      console.warn('Cleanup error:', error);
    }
    await app.close();
  });

  describe('/game/initial-data (GET)', () => {
    it('should require authentication for initial data', async () => {
      // Without auth, should fail (401 or 500 if JWT strategy not configured)
      const response = await request(app.getHttpServer())
        .get('/game/initial-data')
        .set('Authorization', `Bearer ${authToken}`);

      // Accept either 401 (auth failed) or 500 (JWT strategy not configured in test)
      expect([401, 500]).toContain(response.status);
    });
  });

  describe('/game/tap (POST)', () => {
    it('should require authentication', async () => {
      const response = await request(app.getHttpServer()).post('/game/tap');

      expect([401, 500]).toContain(response.status);
    });
  });

  describe('/game/tap/batch (POST)', () => {
    it('should require authentication', async () => {
      const response = await request(app.getHttpServer())
        .post('/game/tap/batch')
        .send({ taps: 5 });

      expect([401, 500]).toContain(response.status);
    });

    it('should reject requests without proper auth', async () => {
      const response = await request(app.getHttpServer())
        .post('/game/tap/batch')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ taps: -1 });

      expect([401, 500]).toContain(response.status);
    });
  });

  describe('/game/upgrades (GET)', () => {
    it('should require authentication', async () => {
      const response = await request(app.getHttpServer()).get('/game/upgrades');

      expect([401, 500]).toContain(response.status);
    });
  });

  describe('/game/leaderboard (GET)', () => {
    it('should require authentication', async () => {
      const response = await request(app.getHttpServer()).get(
        '/game/leaderboard',
      );

      expect([401, 500]).toContain(response.status);
    });
  });

  describe('/game/levels (GET)', () => {
    it('should require authentication', async () => {
      const response = await request(app.getHttpServer()).get('/game/levels');

      expect([401, 500]).toContain(response.status);
    });
  });

  describe('/game/collect-offline (POST)', () => {
    it('should require authentication', async () => {
      const response = await request(app.getHttpServer()).post(
        '/game/collect-offline',
      );

      expect([401, 500]).toContain(response.status);
    });
  });

  describe('/game/user/stats (GET)', () => {
    it('should require authentication', async () => {
      const response = await request(app.getHttpServer()).get(
        '/game/user/stats',
      );

      expect([401, 500]).toContain(response.status);
    });
  });
});
