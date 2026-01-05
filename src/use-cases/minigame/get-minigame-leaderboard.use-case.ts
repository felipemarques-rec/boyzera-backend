import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  MinigameScore,
  MinigameType,
  MinigameDifficulty,
} from '../../domain/entities/minigame-score.entity';
import { User } from '../../domain/entities/user.entity';

export interface LeaderboardEntry {
  userId: string;
  username: string;
  highScore: number;
  rank: number;
  gamesPlayed: number;
}

export interface UserMinigameStats {
  gameType: MinigameType;
  highScore: number;
  gamesPlayed: number;
  totalFollowersEarned: bigint;
  totalGemsEarned: number;
  averageScore: number;
  lastPlayedAt: Date | null;
}

@Injectable()
export class GetMinigameLeaderboardUseCase {
  constructor(
    @InjectRepository(MinigameScore)
    private minigameScoreRepository: Repository<MinigameScore>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async execute(
    gameType: MinigameType,
    difficulty?: MinigameDifficulty,
    limit: number = 100,
  ): Promise<LeaderboardEntry[]> {
    const queryBuilder = this.minigameScoreRepository
      .createQueryBuilder('score')
      .select('score.userId', 'userId')
      .addSelect('MAX(score.highScore)', 'highScore')
      .addSelect('COUNT(*)', 'gamesPlayed')
      .where('score.gameType = :gameType', { gameType })
      .groupBy('score.userId')
      .orderBy('"highScore"', 'DESC')
      .limit(limit);

    if (difficulty) {
      queryBuilder.andWhere('score.difficulty = :difficulty', { difficulty });
    }

    const results = await queryBuilder.getRawMany();

    // Get usernames
    const entries: LeaderboardEntry[] = [];
    let rank = 1;

    for (const result of results) {
      const user = await this.userRepository.findOne({
        where: { id: result.userId },
        select: ['id', 'username'],
      });

      entries.push({
        userId: result.userId,
        username: user?.username || 'Anonymous',
        highScore: parseInt(result.highScore, 10),
        rank: rank++,
        gamesPlayed: parseInt(result.gamesPlayed, 10),
      });
    }

    return entries;
  }

  async getUserRank(
    userId: string,
    gameType: MinigameType,
    difficulty?: MinigameDifficulty,
  ): Promise<number | null> {
    // Get user's high score
    const userScoreQuery = this.minigameScoreRepository
      .createQueryBuilder('score')
      .select('MAX(score.highScore)', 'highScore')
      .where('score.userId = :userId', { userId })
      .andWhere('score.gameType = :gameType', { gameType });

    if (difficulty) {
      userScoreQuery.andWhere('score.difficulty = :difficulty', { difficulty });
    }

    const userResult = await userScoreQuery.getRawOne();
    if (!userResult?.highScore) return null;

    // Count users with higher scores
    const rankQuery = this.minigameScoreRepository
      .createQueryBuilder('score')
      .select('COUNT(DISTINCT score.userId)', 'count')
      .where('score.gameType = :gameType', { gameType });

    if (difficulty) {
      rankQuery.andWhere('score.difficulty = :difficulty', { difficulty });
    }

    // Get distinct users with higher high scores
    const higherScoresQuery = this.minigameScoreRepository
      .createQueryBuilder('score')
      .select('score.userId')
      .where('score.gameType = :gameType', { gameType })
      .groupBy('score.userId')
      .having('MAX(score.highScore) > :userScore', {
        userScore: userResult.highScore,
      });

    if (difficulty) {
      higherScoresQuery.andWhere('score.difficulty = :difficulty', {
        difficulty,
      });
    }

    const higherScores = await higherScoresQuery.getRawMany();
    return higherScores.length + 1;
  }

  async getUserStats(userId: string): Promise<UserMinigameStats[]> {
    const stats: UserMinigameStats[] = [];

    for (const gameType of Object.values(MinigameType)) {
      const scores = await this.minigameScoreRepository.find({
        where: { userId, gameType },
        order: { createdAt: 'DESC' },
      });

      if (scores.length === 0) continue;

      const highScore = Math.max(...scores.map((s) => s.highScore));
      const totalFollowers = scores.reduce(
        (sum, s) => sum + s.followersEarned,
        BigInt(0),
      );
      const totalGems = scores.reduce((sum, s) => sum + s.gemsEarned, 0);
      const avgScore =
        scores.reduce((sum, s) => sum + s.score, 0) / scores.length;

      stats.push({
        gameType,
        highScore,
        gamesPlayed: scores.length,
        totalFollowersEarned: totalFollowers,
        totalGemsEarned: totalGems,
        averageScore: Math.round(avgScore),
        lastPlayedAt: scores[0]?.createdAt || null,
      });
    }

    return stats;
  }

  async getRecentGames(
    userId: string,
    limit: number = 10,
  ): Promise<MinigameScore[]> {
    return this.minigameScoreRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getGlobalStats(): Promise<{
    totalGamesPlayed: number;
    totalPlayersParticipated: number;
    mostPopularGame: MinigameType;
    highestScore: { gameType: MinigameType; score: number; userId: string };
  }> {
    // Total games played
    const totalGames = await this.minigameScoreRepository.count();

    // Total unique players
    const uniquePlayers = await this.minigameScoreRepository
      .createQueryBuilder('score')
      .select('COUNT(DISTINCT score.userId)', 'count')
      .getRawOne();

    // Most popular game
    const popularGame = await this.minigameScoreRepository
      .createQueryBuilder('score')
      .select('score.gameType', 'gameType')
      .addSelect('COUNT(*)', 'count')
      .groupBy('score.gameType')
      .orderBy('count', 'DESC')
      .limit(1)
      .getRawOne();

    // Highest score across all games
    const highestScore = await this.minigameScoreRepository
      .createQueryBuilder('score')
      .orderBy('score.highScore', 'DESC')
      .limit(1)
      .getOne();

    return {
      totalGamesPlayed: totalGames,
      totalPlayersParticipated: parseInt(uniquePlayers?.count || '0', 10),
      mostPopularGame: popularGame?.gameType || MinigameType.QUIZ,
      highestScore: highestScore
        ? {
            gameType: highestScore.gameType,
            score: highestScore.highScore,
            userId: highestScore.userId,
          }
        : { gameType: MinigameType.QUIZ, score: 0, userId: '' },
    };
  }
}
