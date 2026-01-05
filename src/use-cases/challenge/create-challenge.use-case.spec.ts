import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import { CreateChallengeUseCase } from './create-challenge.use-case';
import {
  Challenge,
  ChallengeType,
  ChallengeStatus,
} from '../../domain/entities/challenge.entity';
import { User } from '../../domain/entities/user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('CreateChallengeUseCase', () => {
  let useCase: CreateChallengeUseCase;
  let challengeRepository: jest.Mocked<Repository<Challenge>>;
  let userRepository: jest.Mocked<Repository<User>>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  const mockChallenger: Partial<User> = {
    id: 'challenger-id',
    telegramId: 'challenger-telegram',
    followers: BigInt(10000),
    isBanned: false,
  };

  const mockOpponent: Partial<User> = {
    id: 'opponent-id',
    telegramId: 'opponent-telegram',
    followers: BigInt(5000),
    isBanned: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateChallengeUseCase,
        {
          provide: getRepositoryToken(Challenge),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
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

    useCase = module.get<CreateChallengeUseCase>(CreateChallengeUseCase);
    challengeRepository = module.get(getRepositoryToken(Challenge));
    userRepository = module.get(getRepositoryToken(User));
    eventEmitter = module.get(EventEmitter2);
  });

  describe('execute', () => {
    it('should create a challenge successfully', async () => {
      userRepository.findOne
        .mockResolvedValueOnce(mockChallenger as User)
        .mockResolvedValueOnce(mockOpponent as User);
      challengeRepository.findOne.mockResolvedValue(null); // No existing challenge
      challengeRepository.create.mockReturnValue({
        id: 'challenge-id',
      } as Challenge);
      challengeRepository.save.mockResolvedValue({
        id: 'challenge-id',
      } as Challenge);

      const result = await useCase.execute({
        challengerId: 'challenger-id',
        opponentId: 'opponent-id',
        type: ChallengeType.X1_TAP,
        betAmount: BigInt(1000),
      });

      expect(result).toBeDefined();
      expect(userRepository.save).toHaveBeenCalled();
      expect(challengeRepository.save).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'challenge.created',
        expect.any(Object),
      );
    });

    it('should throw when challenger not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        useCase.execute({
          challengerId: 'non-existent',
          opponentId: 'opponent-id',
          type: ChallengeType.X1_TAP,
          betAmount: BigInt(1000),
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw when opponent not found', async () => {
      userRepository.findOne
        .mockResolvedValueOnce(mockChallenger as User)
        .mockResolvedValueOnce(null);

      await expect(
        useCase.execute({
          challengerId: 'challenger-id',
          opponentId: 'non-existent',
          type: ChallengeType.X1_TAP,
          betAmount: BigInt(1000),
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw when challenger is banned', async () => {
      userRepository.findOne.mockResolvedValue({
        ...mockChallenger,
        isBanned: true,
      } as User);

      await expect(
        useCase.execute({
          challengerId: 'challenger-id',
          opponentId: 'opponent-id',
          type: ChallengeType.X1_TAP,
          betAmount: BigInt(1000),
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when challenging yourself', async () => {
      userRepository.findOne.mockResolvedValue(mockChallenger as User);

      await expect(
        useCase.execute({
          challengerId: 'challenger-id',
          opponentId: 'challenger-id',
          type: ChallengeType.X1_TAP,
          betAmount: BigInt(1000),
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when insufficient followers for bet', async () => {
      userRepository.findOne
        .mockResolvedValueOnce({
          ...mockChallenger,
          followers: BigInt(500),
        } as User)
        .mockResolvedValueOnce(mockOpponent as User);

      await expect(
        useCase.execute({
          challengerId: 'challenger-id',
          opponentId: 'opponent-id',
          type: ChallengeType.X1_TAP,
          betAmount: BigInt(1000),
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when pending challenge already exists', async () => {
      userRepository.findOne
        .mockResolvedValueOnce(mockChallenger as User)
        .mockResolvedValueOnce(mockOpponent as User);
      challengeRepository.findOne.mockResolvedValue({
        id: 'existing-challenge',
      } as Challenge);

      await expect(
        useCase.execute({
          challengerId: 'challenger-id',
          opponentId: 'opponent-id',
          type: ChallengeType.X1_TAP,
          betAmount: BigInt(1000),
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getPendingChallenges', () => {
    it('should return pending challenges for user', async () => {
      const mockChallenges = [
        { id: 'challenge-1', status: ChallengeStatus.PENDING },
      ];
      challengeRepository.find.mockResolvedValue(mockChallenges as Challenge[]);

      const result = await useCase.getPendingChallenges('user-id');

      expect(result).toHaveLength(1);
    });
  });
});
