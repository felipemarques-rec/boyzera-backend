import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  Challenge,
  ChallengeType,
  ChallengeStatus,
  ChallengeConfig,
} from '../../domain/entities/challenge.entity';
import { User } from '../../domain/entities/user.entity';

export interface CreateChallengeParams {
  challengerId: string;
  opponentId: string;
  type: ChallengeType;
  betAmount: bigint;
  config?: ChallengeConfig;
  expiresInMinutes?: number;
}

@Injectable()
export class CreateChallengeUseCase {
  private readonly DEFAULT_EXPIRATION_MINUTES = 15;
  private readonly DEFAULT_CONFIGS: Record<ChallengeType, ChallengeConfig> = {
    [ChallengeType.X1_TAP]: { duration: 30, maxTaps: 1000 },
    [ChallengeType.TRUCO]: { rounds: 3 },
    [ChallengeType.SPEED_TAP]: { duration: 10 },
    [ChallengeType.MEMORY]: { difficulty: 'medium' },
    [ChallengeType.QUIZ]: { rounds: 5, difficulty: 'medium' },
  };

  constructor(
    @InjectRepository(Challenge)
    private challengeRepository: Repository<Challenge>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private eventEmitter: EventEmitter2,
  ) {}

  async execute(params: CreateChallengeParams): Promise<Challenge> {
    const {
      challengerId,
      opponentId,
      type,
      betAmount,
      config,
      expiresInMinutes = this.DEFAULT_EXPIRATION_MINUTES,
    } = params;

    // Validate challenger exists and has enough followers
    const challenger = await this.userRepository.findOne({
      where: { id: challengerId },
    });

    if (!challenger) {
      throw new NotFoundException('Challenger not found');
    }

    if (challenger.isBanned) {
      throw new BadRequestException('Challenger is banned');
    }

    // Validate opponent exists
    const opponent = await this.userRepository.findOne({
      where: { id: opponentId },
    });

    if (!opponent) {
      throw new NotFoundException('Opponent not found');
    }

    if (opponent.isBanned) {
      throw new BadRequestException('Opponent is banned');
    }

    // Cannot challenge yourself
    if (challengerId === opponentId) {
      throw new BadRequestException('Cannot challenge yourself');
    }

    // Validate bet amount
    if (betAmount < BigInt(0)) {
      throw new BadRequestException('Bet amount cannot be negative');
    }

    if (challenger.followers < betAmount) {
      throw new BadRequestException('Insufficient followers for bet');
    }

    // Check for existing pending challenge between these users
    const existingChallenge = await this.challengeRepository.findOne({
      where: [
        {
          challengerId,
          opponentId,
          status: ChallengeStatus.PENDING,
        },
        {
          challengerId: opponentId,
          opponentId: challengerId,
          status: ChallengeStatus.PENDING,
        },
      ],
    });

    if (existingChallenge) {
      throw new BadRequestException(
        'A pending challenge already exists between these users',
      );
    }

    // Deduct bet amount from challenger
    challenger.followers = challenger.followers - betAmount;
    await this.userRepository.save(challenger);

    // Calculate prize pool (bet amount * 2, or bet * 1.9 with 5% house fee)
    const prizePool = betAmount * BigInt(2);

    // Calculate expiration time
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes);

    // Merge default config with provided config
    const finalConfig = {
      ...this.DEFAULT_CONFIGS[type],
      ...config,
    };

    // Create challenge
    const challenge = this.challengeRepository.create({
      type,
      status: ChallengeStatus.PENDING,
      challengerId,
      opponentId,
      betAmount,
      prizePool,
      config: finalConfig,
      expiresAt,
    });

    await this.challengeRepository.save(challenge);

    // Emit challenge created event
    this.eventEmitter.emit('challenge.created', {
      challengeId: challenge.id,
      challengerId,
      opponentId,
      type,
      betAmount: betAmount.toString(),
    });

    return challenge;
  }

  async getPendingChallenges(userId: string): Promise<Challenge[]> {
    const now = new Date();

    return this.challengeRepository.find({
      where: [
        { challengerId: userId, status: ChallengeStatus.PENDING },
        { opponentId: userId, status: ChallengeStatus.PENDING },
      ],
      relations: ['challenger', 'opponent'],
      order: { createdAt: 'DESC' },
    });
  }

  async getActiveChallenges(userId: string): Promise<Challenge[]> {
    return this.challengeRepository.find({
      where: [
        { challengerId: userId, status: ChallengeStatus.ONGOING },
        { opponentId: userId, status: ChallengeStatus.ONGOING },
      ],
      relations: ['challenger', 'opponent'],
      order: { startedAt: 'DESC' },
    });
  }
}
