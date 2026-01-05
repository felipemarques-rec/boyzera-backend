import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SubmitMinigameScoreUseCase } from '../../use-cases/minigame/submit-minigame-score.use-case';
import { GetMinigameLeaderboardUseCase } from '../../use-cases/minigame/get-minigame-leaderboard.use-case';
import {
  MinigameType,
  MinigameDifficulty,
  MinigameMetadata,
} from '../../domain/entities/minigame-score.entity';

class SubmitScoreDto {
  gameType: MinigameType;
  difficulty: MinigameDifficulty;
  score: number;
  durationSeconds: number;
  metadata?: MinigameMetadata;
}

@Controller('minigames')
@UseGuards(AuthGuard('jwt'))
export class MinigameController {
  constructor(
    private submitMinigameScoreUseCase: SubmitMinigameScoreUseCase,
    private getMinigameLeaderboardUseCase: GetMinigameLeaderboardUseCase,
  ) {}

  @Post('score')
  async submitScore(@Request() req: any, @Body() dto: SubmitScoreDto) {
    const result = await this.submitMinigameScoreUseCase.execute({
      userId: req.user.id,
      gameType: dto.gameType,
      difficulty: dto.difficulty,
      score: dto.score,
      durationSeconds: dto.durationSeconds,
      metadata: dto.metadata,
    });

    return {
      success: true,
      data: {
        scoreId: result.score.id,
        score: result.score.score,
        highScore: result.score.highScore,
        isHighScore: result.reward.isHighScore,
        reward: {
          followers: result.reward.followers.toString(),
          gems: result.reward.gems,
        },
      },
    };
  }

  @Get('leaderboard')
  async getLeaderboard(
    @Query('gameType') gameType: MinigameType,
    @Query('difficulty') difficulty?: MinigameDifficulty,
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit?: number,
  ) {
    const leaderboard = await this.getMinigameLeaderboardUseCase.execute(
      gameType,
      difficulty,
      Math.min(limit || 100, 100),
    );

    return {
      success: true,
      data: leaderboard,
    };
  }

  @Get('rank')
  async getUserRank(
    @Request() req: any,
    @Query('gameType') gameType: MinigameType,
    @Query('difficulty') difficulty?: MinigameDifficulty,
  ) {
    const rank = await this.getMinigameLeaderboardUseCase.getUserRank(
      req.user.id,
      gameType,
      difficulty,
    );

    return {
      success: true,
      data: { rank },
    };
  }

  @Get('stats')
  async getUserStats(@Request() req: any) {
    const stats = await this.getMinigameLeaderboardUseCase.getUserStats(
      req.user.id,
    );

    return {
      success: true,
      data: stats.map((s) => ({
        gameType: s.gameType,
        highScore: s.highScore,
        gamesPlayed: s.gamesPlayed,
        totalFollowersEarned: s.totalFollowersEarned.toString(),
        totalGemsEarned: s.totalGemsEarned,
        averageScore: s.averageScore,
        lastPlayedAt: s.lastPlayedAt,
      })),
    };
  }

  @Get('recent')
  async getRecentGames(
    @Request() req: any,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const games = await this.getMinigameLeaderboardUseCase.getRecentGames(
      req.user.id,
      Math.min(limit, 50),
    );

    return {
      success: true,
      data: games.map((g) => ({
        id: g.id,
        gameType: g.gameType,
        difficulty: g.difficulty,
        score: g.score,
        highScore: g.highScore,
        followersEarned: g.followersEarned.toString(),
        gemsEarned: g.gemsEarned,
        durationSeconds: g.durationSeconds,
        createdAt: g.createdAt,
      })),
    };
  }

  @Get('global-stats')
  async getGlobalStats() {
    const stats = await this.getMinigameLeaderboardUseCase.getGlobalStats();

    return {
      success: true,
      data: {
        totalGamesPlayed: stats.totalGamesPlayed,
        totalPlayersParticipated: stats.totalPlayersParticipated,
        mostPopularGame: stats.mostPopularGame,
        highestScore: stats.highestScore,
      },
    };
  }

  @Get('types')
  async getMinigameTypes() {
    return {
      success: true,
      data: {
        types: Object.values(MinigameType).map((type) => ({
          id: type,
          name: this.getMinigameDisplayName(type),
          description: this.getMinigameDescription(type),
        })),
        difficulties: Object.values(MinigameDifficulty),
      },
    };
  }

  private getMinigameDisplayName(type: MinigameType): string {
    const names: Record<MinigameType, string> = {
      [MinigameType.QUIZ]: 'Quiz Brasileiro',
      [MinigameType.MEMORY]: 'Jogo da Memoria',
      [MinigameType.SPEED_TAP]: 'Tap Rapido',
      [MinigameType.WORD_SCRAMBLE]: 'Palavras Embaralhadas',
      [MinigameType.PATTERN_MATCH]: 'Encontre o Padrao',
    };
    return names[type];
  }

  private getMinigameDescription(type: MinigameType): string {
    const descriptions: Record<MinigameType, string> = {
      [MinigameType.QUIZ]: 'Responda perguntas sobre cultura brasileira',
      [MinigameType.MEMORY]: 'Encontre os pares de cartas',
      [MinigameType.SPEED_TAP]: 'Toque o mais rapido possivel',
      [MinigameType.WORD_SCRAMBLE]: 'Descubra as palavras embaralhadas',
      [MinigameType.PATTERN_MATCH]: 'Encontre o padrao correto',
    };
    return descriptions[type];
  }
}
