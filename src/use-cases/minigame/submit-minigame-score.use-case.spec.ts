import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import { SubmitMinigameScoreUseCase } from './submit-minigame-score.use-case';
import {
  MinigameScore,
  MinigameType,
  MinigameDifficulty,
} from '../../domain/entities/minigame-score.entity';
import { User } from '../../domain/entities/user.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('SubmitMinigameScoreUseCase', () => {
  let useCase: SubmitMinigameScoreUseCase;
  let minigameScoreRepository: jest.Mocked<Repository<MinigameScore>>;
  let userRepository: jest.Mocked<Repository<User>>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  const mockUser: Partial<User> = {
    id: 'user-id',
    telegramId: 'telegram-123',
    followers: BigInt(1000),
    gems: 10,
    isBanned: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubmitMinigameScoreUseCase,
        {
          provide: getRepositoryToken(MinigameScore),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            createQueryBuilder: jest.fn(),
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
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<SubmitMinigameScoreUseCase>(
      SubmitMinigameScoreUseCase,
    );
    minigameScoreRepository = module.get(getRepositoryToken(MinigameScore));
    userRepository = module.get(getRepositoryToken(User));
    eventEmitter = module.get(EventEmitter2);
  });

  describe('execute', () => {
    beforeEach(() => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ maxScore: 0 }),
      };
      minigameScoreRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );
    });

    it('should submit score successfully', async () => {
      userRepository.findOne.mockResolvedValue(mockUser as User);
      minigameScoreRepository.create.mockReturnValue({
        id: 'score-id',
        score: 100,
        highScore: 100,
      } as MinigameScore);
      minigameScoreRepository.save.mockResolvedValue({
        id: 'score-id',
        score: 100,
        highScore: 100,
      } as MinigameScore);

      const result = await useCase.execute({
        userId: 'user-id',
        gameType: MinigameType.QUIZ,
        difficulty: MinigameDifficulty.MEDIUM,
        score: 100,
        durationSeconds: 60,
      });

      expect(result.score).toBeDefined();
      expect(result.reward).toBeDefined();
      expect(result.reward.followers).toBeGreaterThan(BigInt(0));
    });

    it('should throw when user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        useCase.execute({
          userId: 'non-existent',
          gameType: MinigameType.QUIZ,
          difficulty: MinigameDifficulty.MEDIUM,
          score: 100,
          durationSeconds: 60,
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
          gameType: MinigameType.QUIZ,
          difficulty: MinigameDifficulty.MEDIUM,
          score: 100,
          durationSeconds: 60,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when score is negative', async () => {
      userRepository.findOne.mockResolvedValue(mockUser as User);

      await expect(
        useCase.execute({
          userId: 'user-id',
          gameType: MinigameType.QUIZ,
          difficulty: MinigameDifficulty.MEDIUM,
          score: -10,
          durationSeconds: 60,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should emit highscore event when beating high score', async () => {
      userRepository.findOne.mockResolvedValue(mockUser as User);
      minigameScoreRepository.create.mockReturnValue({
        id: 'score-id',
        score: 200,
        highScore: 200,
      } as MinigameScore);
      minigameScoreRepository.save.mockResolvedValue({
        id: 'score-id',
        score: 200,
        highScore: 200,
      } as MinigameScore);

      await useCase.execute({
        userId: 'user-id',
        gameType: MinigameType.QUIZ,
        difficulty: MinigameDifficulty.MEDIUM,
        score: 200,
        durationSeconds: 60,
      });

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'minigame.completed',
        expect.any(Object),
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'minigame.highscore',
        expect.any(Object),
      );
    });

    it('should give higher rewards for harder difficulty', async () => {
      userRepository.findOne.mockResolvedValue(mockUser as User);
      minigameScoreRepository.create.mockReturnValue({
        id: 'score-id',
        score: 100,
        highScore: 100,
      } as MinigameScore);
      minigameScoreRepository.save.mockResolvedValue({
        id: 'score-id',
        score: 100,
        highScore: 100,
      } as MinigameScore);

      const easyResult = await useCase.execute({
        userId: 'user-id',
        gameType: MinigameType.QUIZ,
        difficulty: MinigameDifficulty.EASY,
        score: 100,
        durationSeconds: 60,
      });

      const hardResult = await useCase.execute({
        userId: 'user-id',
        gameType: MinigameType.QUIZ,
        difficulty: MinigameDifficulty.HARD,
        score: 100,
        durationSeconds: 60,
      });

      expect(hardResult.reward.followers).toBeGreaterThan(
        easyResult.reward.followers,
      );
    });
  });
});
