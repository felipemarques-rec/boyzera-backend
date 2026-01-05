import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User } from '../../domain/entities/user.entity';
import { Referral } from '../../domain/entities/referral.entity';
import { RedisService } from '../../infrastructure/redis/redis.service';

export interface ProcessReferralResult {
  success: boolean;
  referrerId: string;
  referredId: string;
  bonusFollowers: string;
}

@Injectable()
export class ProcessReferralUseCase {
  private readonly signupBonus = BigInt(1000); // 1000 followers for referrer
  private readonly referredBonus = BigInt(500); // 500 followers for new user

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Referral)
    private referralRepository: Repository<Referral>,
    @InjectDataSource()
    private dataSource: DataSource,
    private redisService: RedisService,
    private eventEmitter: EventEmitter2,
  ) {}

  async execute(
    referredUserId: string,
    referralCode: string,
  ): Promise<ProcessReferralResult> {
    // Find referrer by code
    const referrer = await this.findUserByReferralCode(referralCode);
    if (!referrer) {
      throw new BadRequestException('Invalid referral code');
    }

    // Check if referred user exists
    const referredUser = await this.userRepository.findOne({
      where: { id: referredUserId },
    });
    if (!referredUser) {
      throw new BadRequestException('Referred user not found');
    }

    // Check if user already has a referrer
    if (referredUser.referrerId) {
      throw new BadRequestException('User already has a referrer');
    }

    // Check if trying to refer themselves
    if (referrer.id === referredUserId) {
      throw new BadRequestException('Cannot refer yourself');
    }

    // Check if already referred
    const existingReferral = await this.referralRepository.findOne({
      where: { referredId: referredUserId },
    });
    if (existingReferral) {
      throw new BadRequestException('User already referred');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create referral record
      const referral = this.referralRepository.create({
        referrerId: referrer.id,
        referredId: referredUserId,
        totalEarnedFollowers: this.signupBonus,
        bonusClaimed: true,
      });
      await queryRunner.manager.save(referral);

      // Update referrer's followers
      referrer.followers += this.signupBonus;
      await queryRunner.manager.save(referrer);

      // Update referred user
      referredUser.referrerId = referrer.id;
      referredUser.followers += this.referredBonus;
      await queryRunner.manager.save(referredUser);

      await queryRunner.commitTransaction();

      // Update leaderboards
      await this.redisService.zadd(
        'leaderboard:global',
        Number(referrer.followers),
        referrer.id,
      );
      await this.redisService.zadd(
        'leaderboard:global',
        Number(referredUser.followers),
        referredUserId,
      );

      // Count total referrals for referrer
      const totalReferrals = await this.referralRepository.count({
        where: { referrerId: referrer.id },
      });

      // Emit referral event for mission tracking
      this.eventEmitter.emit('referral.new', {
        userId: referrer.id,
        referredUserId,
        totalReferrals,
      });

      return {
        success: true,
        referrerId: referrer.id,
        referredId: referredUserId,
        bonusFollowers: this.signupBonus.toString(),
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  private async findUserByReferralCode(code: string): Promise<User | null> {
    // Decode the referral code back to telegram ID
    try {
      const telegramId = parseInt(code, 36).toString();
      return this.userRepository.findOne({ where: { telegramId } });
    } catch {
      return null;
    }
  }
}
