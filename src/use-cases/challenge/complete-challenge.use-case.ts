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
  ChallengeStatus,
  ChallengeResult,
} from '../../domain/entities/challenge.entity';
import { User } from '../../domain/entities/user.entity';

export interface SubmitScoreParams {
  challengeId: string;
  userId: string;
  score: number;
}

export interface ChallengeScores {
  challengerScore: number | null;
  opponentScore: number | null;
}

@Injectable()
export class CompleteChallengeUseCase {
  private readonly challengeScores: Map<string, ChallengeScores> = new Map();

  constructor(
    @InjectRepository(Challenge)
    private challengeRepository: Repository<Challenge>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private eventEmitter: EventEmitter2,
  ) {}

  async submitScore(params: SubmitScoreParams): Promise<{
    challenge: Challenge;
    isComplete: boolean;
  }> {
    const { challengeId, userId, score } = params;

    const challenge = await this.challengeRepository.findOne({
      where: { id: challengeId },
    });

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    if (challenge.status !== ChallengeStatus.ONGOING) {
      throw new BadRequestException('Challenge is not ongoing');
    }

    if (!challenge.isParticipant(userId)) {
      throw new BadRequestException(
        'User is not a participant in this challenge',
      );
    }

    // Get or create scores for this challenge
    let scores = this.challengeScores.get(challengeId);
    if (!scores) {
      scores = { challengerScore: null, opponentScore: null };
      this.challengeScores.set(challengeId, scores);
    }

    // Update score for the user
    if (userId === challenge.challengerId) {
      scores.challengerScore = score;
    } else {
      scores.opponentScore = score;
    }

    // Check if both scores are submitted
    if (scores.challengerScore !== null && scores.opponentScore !== null) {
      // Complete the challenge
      const completedChallenge = await this.completeChallenge(
        challenge,
        scores.challengerScore,
        scores.opponentScore,
      );

      // Clean up scores
      this.challengeScores.delete(challengeId);

      return { challenge: completedChallenge, isComplete: true };
    }

    return { challenge, isComplete: false };
  }

  async completeChallenge(
    challenge: Challenge,
    challengerScore: number,
    opponentScore: number,
  ): Promise<Challenge> {
    // Determine winner
    let winnerId: string | null = null;
    if (challengerScore > opponentScore) {
      winnerId = challenge.challengerId;
    } else if (opponentScore > challengerScore) {
      winnerId = challenge.opponentId;
    }
    // null for tie

    // Create result
    const result: ChallengeResult = {
      challengerId: challenge.challengerId,
      challengerScore,
      opponentId: challenge.opponentId,
      opponentScore,
      winnerId,
      completedAt: new Date(),
    };

    // Update challenge
    challenge.status = ChallengeStatus.COMPLETED;
    challenge.result = result;
    challenge.endedAt = new Date();
    await this.challengeRepository.save(challenge);

    // Distribute rewards
    await this.distributeRewards(challenge, winnerId);

    // Emit challenge completed event
    this.eventEmitter.emit('challenge.completed', {
      challengeId: challenge.id,
      challengerId: challenge.challengerId,
      challengerScore,
      opponentId: challenge.opponentId,
      opponentScore,
      winnerId,
      prizePool: challenge.prizePool.toString(),
    });

    return challenge;
  }

  private async distributeRewards(
    challenge: Challenge,
    winnerId: string | null,
  ): Promise<void> {
    if (winnerId) {
      // Winner takes all
      const winner = await this.userRepository.findOne({
        where: { id: winnerId },
      });

      if (winner) {
        winner.followers = winner.followers + challenge.prizePool;
        await this.userRepository.save(winner);

        this.eventEmitter.emit('challenge.reward.distributed', {
          challengeId: challenge.id,
          userId: winnerId,
          amount: challenge.prizePool.toString(),
          isWinner: true,
        });
      }
    } else {
      // Tie - split the pot or return bets
      const challenger = await this.userRepository.findOne({
        where: { id: challenge.challengerId },
      });
      const opponent = await this.userRepository.findOne({
        where: { id: challenge.opponentId },
      });

      // Return original bets
      if (challenger) {
        challenger.followers = challenger.followers + challenge.betAmount;
        await this.userRepository.save(challenger);
      }

      if (opponent) {
        opponent.followers = opponent.followers + challenge.betAmount;
        await this.userRepository.save(opponent);
      }

      this.eventEmitter.emit('challenge.tie', {
        challengeId: challenge.id,
        challengerId: challenge.challengerId,
        opponentId: challenge.opponentId,
        betReturned: challenge.betAmount.toString(),
      });
    }
  }

  async getChallengeHistory(
    userId: string,
    limit: number = 20,
  ): Promise<Challenge[]> {
    return this.challengeRepository.find({
      where: [
        { challengerId: userId, status: ChallengeStatus.COMPLETED },
        { opponentId: userId, status: ChallengeStatus.COMPLETED },
      ],
      relations: ['challenger', 'opponent'],
      order: { endedAt: 'DESC' },
      take: limit,
    });
  }

  async getChallengeStats(userId: string): Promise<{
    totalChallenges: number;
    wins: number;
    losses: number;
    ties: number;
    winRate: number;
    totalEarned: bigint;
    totalLost: bigint;
  }> {
    const challenges = await this.challengeRepository.find({
      where: [
        { challengerId: userId, status: ChallengeStatus.COMPLETED },
        { opponentId: userId, status: ChallengeStatus.COMPLETED },
      ],
    });

    let wins = 0;
    let losses = 0;
    let ties = 0;
    let totalEarned = BigInt(0);
    let totalLost = BigInt(0);

    for (const challenge of challenges) {
      if (!challenge.result) continue;

      if (challenge.result.winnerId === userId) {
        wins++;
        totalEarned += challenge.prizePool - challenge.betAmount;
      } else if (challenge.result.winnerId === null) {
        ties++;
      } else {
        losses++;
        totalLost += challenge.betAmount;
      }
    }

    const totalChallenges = challenges.length;
    const winRate = totalChallenges > 0 ? (wins / totalChallenges) * 100 : 0;

    return {
      totalChallenges,
      wins,
      losses,
      ties,
      winRate,
      totalEarned,
      totalLost,
    };
  }
}
