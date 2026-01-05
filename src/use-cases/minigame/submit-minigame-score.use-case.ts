import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  MinigameScore,
  MinigameType,
  MinigameDifficulty,
  MinigameMetadata,
} from '../../domain/entities/minigame-score.entity';
import { User } from '../../domain/entities/user.entity';

export interface SubmitMinigameScoreParams {
  userId: string;
  gameType: MinigameType;
  difficulty: MinigameDifficulty;
  score: number;
  durationSeconds: number;
  metadata?: MinigameMetadata;
}

export interface MinigameReward {
  followers: bigint;
  gems: number;
  isHighScore: boolean;
}

@Injectable()
export class SubmitMinigameScoreUseCase {
  // Reward multipliers based on difficulty
  private readonly DIFFICULTY_MULTIPLIERS = {
    [MinigameDifficulty.EASY]: 1,
    [MinigameDifficulty.MEDIUM]: 1.5,
    [MinigameDifficulty.HARD]: 2,
  };

  // Base rewards per game type
  private readonly BASE_REWARDS: Record<
    MinigameType,
    { followers: number; gems: number }
  > = {
    [MinigameType.QUIZ]: { followers: 50, gems: 1 },
    [MinigameType.MEMORY]: { followers: 30, gems: 1 },
    [MinigameType.SPEED_TAP]: { followers: 20, gems: 0 },
    [MinigameType.WORD_SCRAMBLE]: { followers: 40, gems: 1 },
    [MinigameType.PATTERN_MATCH]: { followers: 35, gems: 1 },
  };

  constructor(
    @InjectRepository(MinigameScore)
    private minigameScoreRepository: Repository<MinigameScore>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private eventEmitter: EventEmitter2,
  ) {}

  async execute(params: SubmitMinigameScoreParams): Promise<{
    score: MinigameScore;
    reward: MinigameReward;
  }> {
    const { userId, gameType, difficulty, score, durationSeconds, metadata } =
      params;

    // Validate user exists
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isBanned) {
      throw new BadRequestException('User is banned');
    }

    // Validate score
    if (score < 0) {
      throw new BadRequestException('Score cannot be negative');
    }

    // Get user's high score for this game type
    const existingHighScore = await this.getHighScore(userId, gameType);
    const isHighScore = score > existingHighScore;

    // Calculate rewards
    const reward = this.calculateReward(
      gameType,
      difficulty,
      score,
      isHighScore,
    );

    // Create minigame score record
    const minigameScore = this.minigameScoreRepository.create({
      userId,
      gameType,
      difficulty,
      score,
      highScore: isHighScore ? score : existingHighScore,
      followersEarned: reward.followers,
      gemsEarned: reward.gems,
      durationSeconds,
      metadata,
    });

    await this.minigameScoreRepository.save(minigameScore);

    // Update user rewards
    user.followers = user.followers + reward.followers;
    user.gems += reward.gems;
    await this.userRepository.save(user);

    // Emit minigame completed event
    this.eventEmitter.emit('minigame.completed', {
      userId,
      gameType,
      score,
      isHighScore,
      followersEarned: reward.followers.toString(),
      gemsEarned: reward.gems,
    });

    if (isHighScore) {
      this.eventEmitter.emit('minigame.highscore', {
        userId,
        gameType,
        score,
        previousHighScore: existingHighScore,
      });
    }

    return { score: minigameScore, reward };
  }

  private async getHighScore(
    userId: string,
    gameType: MinigameType,
  ): Promise<number> {
    const result = await this.minigameScoreRepository
      .createQueryBuilder('score')
      .select('MAX(score.highScore)', 'maxScore')
      .where('score.userId = :userId', { userId })
      .andWhere('score.gameType = :gameType', { gameType })
      .getRawOne();

    return result?.maxScore ?? 0;
  }

  private calculateReward(
    gameType: MinigameType,
    difficulty: MinigameDifficulty,
    score: number,
    isHighScore: boolean,
  ): MinigameReward {
    const baseReward = this.BASE_REWARDS[gameType];
    const difficultyMultiplier = this.DIFFICULTY_MULTIPLIERS[difficulty];
    const scoreMultiplier = Math.min(score / 100, 5); // Cap at 5x
    const highScoreBonus = isHighScore ? 1.5 : 1;

    const followers = BigInt(
      Math.floor(
        baseReward.followers *
          difficultyMultiplier *
          scoreMultiplier *
          highScoreBonus,
      ),
    );

    const gems = isHighScore
      ? baseReward.gems * Math.floor(difficultyMultiplier)
      : 0;

    return { followers, gems, isHighScore };
  }
}
