import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Mission } from '../../domain/entities/mission.entity';
import { UserMission } from '../../domain/entities/user-mission.entity';
import { User } from '../../domain/entities/user.entity';
import { RedisService } from '../../infrastructure/redis/redis.service';

export interface ClaimRewardResult {
  success: boolean;
  missionId: string;
  missionTitle: string;
  rewards: {
    followers?: string;
    gems?: number;
    energy?: number;
    tokensBz?: number;
  };
  newTotals: {
    followers: string;
    gems: number;
    energy: number;
    tokensBz: number;
  };
}

@Injectable()
export class ClaimMissionRewardUseCase {
  constructor(
    @InjectRepository(Mission)
    private missionRepository: Repository<Mission>,
    @InjectRepository(UserMission)
    private userMissionRepository: Repository<UserMission>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectDataSource()
    private dataSource: DataSource,
    private redisService: RedisService,
    private eventEmitter: EventEmitter2,
  ) {}

  async execute(userId: string, missionId: string): Promise<ClaimRewardResult> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const mission = await queryRunner.manager.findOne(Mission, {
        where: { id: missionId },
      });

      if (!mission) {
        throw new BadRequestException('Mission not found');
      }

      const userMission = await queryRunner.manager.findOne(UserMission, {
        where: { userId, missionId },
      });

      if (!userMission) {
        throw new BadRequestException('Mission not started');
      }

      if (!userMission.completed) {
        throw new BadRequestException('Mission not completed yet');
      }

      if (userMission.claimed) {
        throw new BadRequestException('Reward already claimed');
      }

      // Check if mission period has expired
      if (userMission.periodEnd && userMission.periodEnd < new Date()) {
        throw new BadRequestException('Mission period has expired');
      }

      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Apply rewards
      const reward = mission.reward;
      const appliedRewards: ClaimRewardResult['rewards'] = {};

      if (reward.followers) {
        user.followers += BigInt(reward.followers);
        appliedRewards.followers = reward.followers.toString();
      }

      if (reward.gems) {
        user.gems += reward.gems;
        appliedRewards.gems = reward.gems;
      }

      if (reward.energy) {
        user.energy = Math.min(user.energy + reward.energy, user.maxEnergy);
        appliedRewards.energy = reward.energy;
      }

      if (reward.tokensBz) {
        user.tokensBz += reward.tokensBz;
        appliedRewards.tokensBz = reward.tokensBz;
      }

      // Mark as claimed
      userMission.claimed = true;
      userMission.claimedAt = new Date();

      await queryRunner.manager.save(user);
      await queryRunner.manager.save(userMission);

      await queryRunner.commitTransaction();

      // Update leaderboard in Redis
      await this.redisService.zadd(
        'leaderboard:global',
        Number(user.followers),
        user.id,
      );

      // Emit reward claimed event
      this.eventEmitter.emit('mission.rewardClaimed', {
        userId,
        missionId: mission.id,
        missionTitle: mission.title,
        rewards: appliedRewards,
      });

      return {
        success: true,
        missionId: mission.id,
        missionTitle: mission.title,
        rewards: appliedRewards,
        newTotals: {
          followers: user.followers.toString(),
          gems: user.gems,
          energy: user.energy,
          tokensBz: user.tokensBz,
        },
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async claimAllCompleted(userId: string): Promise<ClaimRewardResult[]> {
    const completedMissions = await this.userMissionRepository.find({
      where: {
        userId,
        completed: true,
        claimed: false,
      },
      relations: ['mission'],
    });

    const results: ClaimRewardResult[] = [];

    for (const userMission of completedMissions) {
      // Skip expired missions
      if (userMission.periodEnd && userMission.periodEnd < new Date()) {
        continue;
      }

      try {
        const result = await this.execute(userId, userMission.missionId);
        results.push(result);
      } catch {
        // Continue with other missions if one fails
        continue;
      }
    }

    return results;
  }
}
