import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateChallengeUseCase } from '../../use-cases/challenge/create-challenge.use-case';
import { AcceptChallengeUseCase } from '../../use-cases/challenge/accept-challenge.use-case';
import { CompleteChallengeUseCase } from '../../use-cases/challenge/complete-challenge.use-case';
import { ChallengeType } from '../../domain/entities/challenge.entity';

class CreateChallengeDto {
  opponentId: string;
  type: ChallengeType;
  betAmount: string;
  config?: {
    duration?: number;
    rounds?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
  };
}

class SubmitScoreDto {
  score: number;
}

@Controller('challenges')
@UseGuards(AuthGuard('jwt'))
export class ChallengeController {
  constructor(
    private createChallengeUseCase: CreateChallengeUseCase,
    private acceptChallengeUseCase: AcceptChallengeUseCase,
    private completeChallengeUseCase: CompleteChallengeUseCase,
  ) {}

  @Post()
  async createChallenge(@Request() req: any, @Body() dto: CreateChallengeDto) {
    const challenge = await this.createChallengeUseCase.execute({
      challengerId: req.user.id,
      opponentId: dto.opponentId,
      type: dto.type,
      betAmount: BigInt(dto.betAmount),
      config: dto.config,
    });

    return {
      success: true,
      data: this.formatChallenge(challenge),
    };
  }

  @Get('pending')
  async getPendingChallenges(@Request() req: any) {
    const challenges = await this.createChallengeUseCase.getPendingChallenges(
      req.user.id,
    );

    return {
      success: true,
      data: challenges.map((c) => this.formatChallenge(c)),
    };
  }

  @Get('active')
  async getActiveChallenges(@Request() req: any) {
    const challenges = await this.createChallengeUseCase.getActiveChallenges(
      req.user.id,
    );

    return {
      success: true,
      data: challenges.map((c) => this.formatChallenge(c)),
    };
  }

  @Post(':id/accept')
  async acceptChallenge(@Param('id') id: string, @Request() req: any) {
    const challenge = await this.acceptChallengeUseCase.execute(
      id,
      req.user.id,
    );

    return {
      success: true,
      data: this.formatChallenge(challenge),
    };
  }

  @Post(':id/start')
  async startChallenge(@Param('id') id: string) {
    const challenge = await this.acceptChallengeUseCase.startChallenge(id);

    return {
      success: true,
      data: this.formatChallenge(challenge),
    };
  }

  @Post(':id/decline')
  async declineChallenge(@Param('id') id: string, @Request() req: any) {
    const challenge = await this.acceptChallengeUseCase.declineChallenge(
      id,
      req.user.id,
    );

    return {
      success: true,
      data: this.formatChallenge(challenge),
      message: 'Challenge declined',
    };
  }

  @Post(':id/cancel')
  async cancelChallenge(@Param('id') id: string, @Request() req: any) {
    const challenge = await this.acceptChallengeUseCase.cancelChallenge(
      id,
      req.user.id,
    );

    return {
      success: true,
      data: this.formatChallenge(challenge),
      message: 'Challenge cancelled',
    };
  }

  @Post(':id/score')
  async submitScore(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: SubmitScoreDto,
  ) {
    const result = await this.completeChallengeUseCase.submitScore({
      challengeId: id,
      userId: req.user.id,
      score: dto.score,
    });

    return {
      success: true,
      data: {
        challenge: this.formatChallenge(result.challenge),
        isComplete: result.isComplete,
      },
    };
  }

  @Get('history')
  async getChallengeHistory(
    @Request() req: any,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    const challenges = await this.completeChallengeUseCase.getChallengeHistory(
      req.user.id,
      Math.min(limit, 50),
    );

    return {
      success: true,
      data: challenges.map((c) => this.formatChallenge(c)),
    };
  }

  @Get('stats')
  async getChallengeStats(@Request() req: any) {
    const stats = await this.completeChallengeUseCase.getChallengeStats(
      req.user.id,
    );

    return {
      success: true,
      data: {
        totalChallenges: stats.totalChallenges,
        wins: stats.wins,
        losses: stats.losses,
        ties: stats.ties,
        winRate: stats.winRate.toFixed(1),
        totalEarned: stats.totalEarned.toString(),
        totalLost: stats.totalLost.toString(),
      },
    };
  }

  private formatChallenge(challenge: any) {
    return {
      id: challenge.id,
      type: challenge.type,
      status: challenge.status,
      challengerId: challenge.challengerId,
      challengerUsername: challenge.challenger?.username,
      opponentId: challenge.opponentId,
      opponentUsername: challenge.opponent?.username,
      betAmount: challenge.betAmount.toString(),
      prizePool: challenge.prizePool.toString(),
      config: challenge.config,
      result: challenge.result
        ? {
            challengerScore: challenge.result.challengerScore,
            opponentScore: challenge.result.opponentScore,
            winnerId: challenge.result.winnerId,
          }
        : null,
      expiresAt: challenge.expiresAt,
      startedAt: challenge.startedAt,
      endedAt: challenge.endedAt,
      createdAt: challenge.createdAt,
    };
  }
}
