import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  Challenge,
  ChallengeStatus,
} from '../../domain/entities/challenge.entity';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class AcceptChallengeUseCase {
  constructor(
    @InjectRepository(Challenge)
    private challengeRepository: Repository<Challenge>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private eventEmitter: EventEmitter2,
  ) {}

  async execute(challengeId: string, userId: string): Promise<Challenge> {
    const challenge = await this.challengeRepository.findOne({
      where: { id: challengeId },
      relations: ['challenger', 'opponent'],
    });

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    // Validate user is the opponent
    if (challenge.opponentId !== userId) {
      throw new ForbiddenException('Only the challenged player can accept');
    }

    // Validate challenge can be accepted
    if (!challenge.canAccept()) {
      if (challenge.expiresAt && new Date() > challenge.expiresAt) {
        // Mark as expired
        challenge.status = ChallengeStatus.EXPIRED;
        await this.challengeRepository.save(challenge);

        // Refund challenger
        await this.refundChallenger(challenge);

        throw new BadRequestException('Challenge has expired');
      }
      throw new BadRequestException('Challenge cannot be accepted');
    }

    // Get opponent and validate they have enough followers
    const opponent = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!opponent) {
      throw new NotFoundException('User not found');
    }

    if (opponent.isBanned) {
      throw new BadRequestException('You are banned from challenges');
    }

    if (opponent.followers < challenge.betAmount) {
      throw new BadRequestException(
        'Insufficient followers to accept this challenge',
      );
    }

    // Deduct bet amount from opponent
    opponent.followers = opponent.followers - challenge.betAmount;
    await this.userRepository.save(opponent);

    // Update challenge status
    challenge.status = ChallengeStatus.ACCEPTED;
    await this.challengeRepository.save(challenge);

    // Emit challenge accepted event
    this.eventEmitter.emit('challenge.accepted', {
      challengeId: challenge.id,
      challengerId: challenge.challengerId,
      opponentId: challenge.opponentId,
      type: challenge.type,
    });

    return challenge;
  }

  async startChallenge(challengeId: string): Promise<Challenge> {
    const challenge = await this.challengeRepository.findOne({
      where: { id: challengeId },
    });

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    if (challenge.status !== ChallengeStatus.ACCEPTED) {
      throw new BadRequestException(
        'Challenge must be accepted before starting',
      );
    }

    challenge.status = ChallengeStatus.ONGOING;
    challenge.startedAt = new Date();
    await this.challengeRepository.save(challenge);

    // Emit challenge started event
    this.eventEmitter.emit('challenge.started', {
      challengeId: challenge.id,
      challengerId: challenge.challengerId,
      opponentId: challenge.opponentId,
      type: challenge.type,
      config: challenge.config,
    });

    return challenge;
  }

  async declineChallenge(
    challengeId: string,
    userId: string,
  ): Promise<Challenge> {
    const challenge = await this.challengeRepository.findOne({
      where: { id: challengeId },
    });

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    if (challenge.opponentId !== userId) {
      throw new ForbiddenException('Only the challenged player can decline');
    }

    if (challenge.status !== ChallengeStatus.PENDING) {
      throw new BadRequestException('Challenge is not pending');
    }

    // Update status
    challenge.status = ChallengeStatus.CANCELLED;
    await this.challengeRepository.save(challenge);

    // Refund challenger
    await this.refundChallenger(challenge);

    // Emit challenge declined event
    this.eventEmitter.emit('challenge.declined', {
      challengeId: challenge.id,
      challengerId: challenge.challengerId,
      opponentId: challenge.opponentId,
    });

    return challenge;
  }

  async cancelChallenge(
    challengeId: string,
    userId: string,
  ): Promise<Challenge> {
    const challenge = await this.challengeRepository.findOne({
      where: { id: challengeId },
    });

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    if (challenge.challengerId !== userId) {
      throw new ForbiddenException('Only the challenger can cancel');
    }

    if (challenge.status !== ChallengeStatus.PENDING) {
      throw new BadRequestException('Can only cancel pending challenges');
    }

    // Update status
    challenge.status = ChallengeStatus.CANCELLED;
    await this.challengeRepository.save(challenge);

    // Refund challenger
    await this.refundChallenger(challenge);

    // Emit challenge cancelled event
    this.eventEmitter.emit('challenge.cancelled', {
      challengeId: challenge.id,
      challengerId: challenge.challengerId,
      opponentId: challenge.opponentId,
    });

    return challenge;
  }

  private async refundChallenger(challenge: Challenge): Promise<void> {
    const challenger = await this.userRepository.findOne({
      where: { id: challenge.challengerId },
    });

    if (challenger) {
      challenger.followers = challenger.followers + challenge.betAmount;
      await this.userRepository.save(challenger);
    }
  }
}
