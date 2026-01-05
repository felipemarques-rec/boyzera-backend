import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../domain/entities/user.entity';
import { Referral } from '../../domain/entities/referral.entity';

export interface ReferralStats {
  totalReferrals: number;
  totalEarnedFollowers: string;
  referrals: ReferralInfo[];
  milestones: MilestoneInfo[];
}

export interface ReferralInfo {
  id: string;
  username: string | null;
  firstName: string | null;
  followers: string;
  earnedFromReferral: string;
  joinedAt: Date;
}

export interface MilestoneInfo {
  count: number;
  reward: { gems: number };
  achieved: boolean;
}

@Injectable()
export class GetReferralStatsUseCase {
  private readonly milestones = [
    { count: 5, reward: { gems: 50 } },
    { count: 10, reward: { gems: 100 } },
    { count: 25, reward: { gems: 250 } },
    { count: 50, reward: { gems: 500 } },
    { count: 100, reward: { gems: 1000 } },
  ];

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Referral)
    private referralRepository: Repository<Referral>,
  ) {}

  async execute(userId: string): Promise<ReferralStats> {
    const referrals = await this.referralRepository.find({
      where: { referrerId: userId },
      relations: ['referred'],
      order: { createdAt: 'DESC' },
    });

    const totalReferrals = referrals.length;
    let totalEarnedFollowers = BigInt(0);

    const referralInfos: ReferralInfo[] = [];

    for (const ref of referrals) {
      totalEarnedFollowers += ref.totalEarnedFollowers;

      referralInfos.push({
        id: ref.referredId,
        username: ref.referred?.username || null,
        firstName: ref.referred?.firstName || null,
        followers: ref.referred?.followers.toString() || '0',
        earnedFromReferral: ref.totalEarnedFollowers.toString(),
        joinedAt: ref.createdAt,
      });
    }

    const milestoneInfos: MilestoneInfo[] = this.milestones.map((m) => ({
      ...m,
      achieved: totalReferrals >= m.count,
    }));

    return {
      totalReferrals,
      totalEarnedFollowers: totalEarnedFollowers.toString(),
      referrals: referralInfos,
      milestones: milestoneInfos,
    };
  }

  async getReferralLeaderboard(
    limit: number = 50,
  ): Promise<{ userId: string; count: number; username: string | null }[]> {
    const result = await this.referralRepository
      .createQueryBuilder('referral')
      .select('referral.referrerId', 'userId')
      .addSelect('COUNT(*)', 'count')
      .groupBy('referral.referrerId')
      .orderBy('count', 'DESC')
      .limit(limit)
      .getRawMany();

    // Get usernames
    const userIds = result.map((r) => r.userId);
    const users = await this.userRepository.findByIds(userIds);
    const userMap = new Map(users.map((u) => [u.id, u.username]));

    return result.map((r) => ({
      userId: r.userId,
      count: parseInt(r.count, 10),
      username: userMap.get(r.userId) || null,
    }));
  }
}
