import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Referral } from '../../domain/entities/referral.entity';
import { User } from '../../domain/entities/user.entity';
import { AdminAuthGuard } from '../guards/admin-auth.guard';

@Controller('admin/referrals')
@UseGuards(AdminAuthGuard)
export class AdminReferralsController {
  constructor(
    @InjectRepository(Referral)
    private referralRepository: Repository<Referral>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  @Get()
  async getReferrals(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('search') search?: string,
    @Query('sortBy') sortBy: string = 'createdAt',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC',
  ) {
    const skip = (page - 1) * limit;

    const queryBuilder = this.referralRepository
      .createQueryBuilder('referral')
      .leftJoinAndSelect('referral.referrer', 'referrer')
      .leftJoinAndSelect('referral.referred', 'referred');

    if (search) {
      queryBuilder.andWhere(
        '(referrer.username ILIKE :search OR referrer.firstName ILIKE :search OR referred.username ILIKE :search OR referred.firstName ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const validSortFields = ['createdAt', 'totalEarnedFollowers'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(`referral.${sortField}`, sortOrder);

    const [referrals, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: referrals.map((r) => ({
        id: r.id,
        referrer: r.referrer
          ? {
              id: r.referrer.id,
              username: r.referrer.username,
              firstName: r.referrer.firstName,
              lastName: r.referrer.lastName,
            }
          : null,
        referred: r.referred
          ? {
              id: r.referred.id,
              username: r.referred.username,
              firstName: r.referred.firstName,
              lastName: r.referred.lastName,
            }
          : null,
        totalEarnedFollowers: r.totalEarnedFollowers.toString(),
        bonusClaimed: r.bonusClaimed,
        createdAt: r.createdAt,
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
    const total = await this.referralRepository.count();
    const bonusClaimed = await this.referralRepository.count({ where: { bonusClaimed: true } });

    // Top referrers
    const topReferrers = await this.referralRepository
      .createQueryBuilder('referral')
      .select('referral.referrerId', 'referrerId')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(referral.totalEarnedFollowers)', 'totalEarned')
      .groupBy('referral.referrerId')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    // Get user details for top referrers
    const topReferrersWithUsers = await Promise.all(
      topReferrers.map(async (r) => {
        const user = await this.userRepository.findOne({ where: { id: r.referrerId } });
        return {
          userId: r.referrerId,
          username: user?.username,
          firstName: user?.firstName,
          referralCount: parseInt(r.count),
          totalEarned: r.totalEarned?.toString() || '0',
        };
      }),
    );

    // Today's referrals
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayReferrals = await this.referralRepository
      .createQueryBuilder('referral')
      .where('referral.createdAt >= :today', { today })
      .getCount();

    return {
      total,
      bonusClaimed,
      bonusPending: total - bonusClaimed,
      todayReferrals,
      topReferrers: topReferrersWithUsers,
    };
  }

  @Get('user/:userId')
  async getUserReferrals(@Param('userId') userId: string) {
    const referrals = await this.referralRepository.find({
      where: { referrerId: userId },
      relations: ['referred'],
      order: { createdAt: 'DESC' },
    });

    const user = await this.userRepository.findOne({ where: { id: userId } });

    return {
      user: user
        ? {
            id: user.id,
            username: user.username,
            firstName: user.firstName,
          }
        : null,
      referralCount: referrals.length,
      referrals: referrals.map((r) => ({
        id: r.id,
        referred: r.referred
          ? {
              id: r.referred.id,
              username: r.referred.username,
              firstName: r.referred.firstName,
            }
          : null,
        totalEarnedFollowers: r.totalEarnedFollowers.toString(),
        bonusClaimed: r.bonusClaimed,
        createdAt: r.createdAt,
      })),
    };
  }
}
