import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Challenge, ChallengeType, ChallengeStatus } from '../../domain/entities/challenge.entity';
import { User } from '../../domain/entities/user.entity';
import { AdminAuthGuard } from '../guards/admin-auth.guard';

@Controller('admin/challenges')
@UseGuards(AdminAuthGuard)
export class AdminChallengesController {
  constructor(
    @InjectRepository(Challenge)
    private challengeRepository: Repository<Challenge>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  @Get()
  async getChallenges(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('type') type?: ChallengeType,
    @Query('status') status?: ChallengeStatus,
    @Query('sortBy') sortBy: string = 'createdAt',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC',
  ) {
    const skip = (page - 1) * limit;

    const queryBuilder = this.challengeRepository
      .createQueryBuilder('challenge')
      .leftJoinAndSelect('challenge.challenger', 'challenger')
      .leftJoinAndSelect('challenge.opponent', 'opponent');

    if (type) {
      queryBuilder.andWhere('challenge.type = :type', { type });
    }

    if (status) {
      queryBuilder.andWhere('challenge.status = :status', { status });
    }

    const validSortFields = ['createdAt', 'betAmount', 'prizePool'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(`challenge.${sortField}`, sortOrder);

    const [challenges, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: challenges.map((c) => ({
        id: c.id,
        type: c.type,
        status: c.status,
        challenger: c.challenger
          ? {
              id: c.challenger.id,
              username: c.challenger.username,
              firstName: c.challenger.firstName,
            }
          : null,
        opponent: c.opponent
          ? {
              id: c.opponent.id,
              username: c.opponent.username,
              firstName: c.opponent.firstName,
            }
          : null,
        betAmount: c.betAmount.toString(),
        prizePool: c.prizePool.toString(),
        config: c.config,
        result: c.result,
        startedAt: c.startedAt,
        endedAt: c.endedAt,
        createdAt: c.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  @Get('stats')
  async getStats() {
    const total = await this.challengeRepository.count();

    // By status
    const byStatus: Record<string, number> = {};
    for (const status of Object.values(ChallengeStatus)) {
      byStatus[status] = await this.challengeRepository.count({ where: { status } });
    }

    // By type
    const byType: Record<string, number> = {};
    for (const type of Object.values(ChallengeType)) {
      byType[type] = await this.challengeRepository.count({ where: { type } });
    }

    // Total bets
    const totalBets = await this.challengeRepository
      .createQueryBuilder('challenge')
      .select('SUM(challenge.betAmount)', 'total')
      .where('challenge.status = :status', { status: ChallengeStatus.COMPLETED })
      .getRawOne();

    // Today's challenges
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayChallenges = await this.challengeRepository
      .createQueryBuilder('challenge')
      .where('challenge.createdAt >= :today', { today })
      .getCount();

    // Top challengers
    const topChallengers = await this.challengeRepository
      .createQueryBuilder('challenge')
      .select('challenge.challengerId', 'userId')
      .addSelect('COUNT(*)', 'count')
      .where('challenge.status = :status', { status: ChallengeStatus.COMPLETED })
      .groupBy('challenge.challengerId')
      .orderBy('count', 'DESC')
      .limit(5)
      .getRawMany();

    const topChallengersWithUsers = await Promise.all(
      topChallengers.map(async (t) => {
        const user = await this.userRepository.findOne({ where: { id: t.userId } });
        return {
          userId: t.userId,
          username: user?.username,
          firstName: user?.firstName,
          challengeCount: parseInt(t.count),
        };
      }),
    );

    return {
      total,
      todayChallenges,
      totalBetsAmount: totalBets?.total?.toString() || '0',
      byStatus,
      byType,
      topChallengers: topChallengersWithUsers,
    };
  }

  @Get(':id')
  async getChallenge(@Param('id') id: string) {
    const challenge = await this.challengeRepository.findOne({
      where: { id },
      relations: ['challenger', 'opponent'],
    });

    if (!challenge) {
      return { error: 'Desafio nao encontrado' };
    }

    return {
      ...challenge,
      betAmount: challenge.betAmount.toString(),
      prizePool: challenge.prizePool.toString(),
      challenger: challenge.challenger
        ? {
            id: challenge.challenger.id,
            username: challenge.challenger.username,
            firstName: challenge.challenger.firstName,
            lastName: challenge.challenger.lastName,
          }
        : null,
      opponent: challenge.opponent
        ? {
            id: challenge.opponent.id,
            username: challenge.opponent.username,
            firstName: challenge.opponent.firstName,
            lastName: challenge.opponent.lastName,
          }
        : null,
    };
  }

  @Get('user/:userId')
  async getUserChallenges(
    @Param('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    const skip = (page - 1) * limit;

    const [challenges, total] = await this.challengeRepository
      .createQueryBuilder('challenge')
      .leftJoinAndSelect('challenge.challenger', 'challenger')
      .leftJoinAndSelect('challenge.opponent', 'opponent')
      .where('challenge.challengerId = :userId OR challenge.opponentId = :userId', { userId })
      .orderBy('challenge.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const user = await this.userRepository.findOne({ where: { id: userId } });

    // Stats
    const wins = challenges.filter((c) => c.result?.winnerId === userId).length;
    const losses = challenges.filter(
      (c) => c.result?.winnerId && c.result.winnerId !== userId,
    ).length;
    const ties = challenges.filter(
      (c) => c.status === ChallengeStatus.COMPLETED && !c.result?.winnerId,
    ).length;

    return {
      user: user
        ? {
            id: user.id,
            username: user.username,
            firstName: user.firstName,
          }
        : null,
      stats: {
        total: total,
        wins,
        losses,
        ties,
        winRate: total > 0 ? Math.round((wins / total) * 100) : 0,
      },
      data: challenges.map((c) => ({
        id: c.id,
        type: c.type,
        status: c.status,
        challenger: c.challenger
          ? {
              id: c.challenger.id,
              username: c.challenger.username,
              firstName: c.challenger.firstName,
            }
          : null,
        opponent: c.opponent
          ? {
              id: c.opponent.id,
              username: c.opponent.username,
              firstName: c.opponent.firstName,
            }
          : null,
        betAmount: c.betAmount.toString(),
        result: c.result,
        createdAt: c.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
