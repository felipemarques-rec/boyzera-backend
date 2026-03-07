import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThan } from 'typeorm';
import { Level } from '../entities/level.entity';
import { User } from '../entities/user.entity';

export interface LevelUpResult {
  leveledUp: boolean;
  previousLevel: number;
  newLevel: number;
  rewards: {
    gems: number;
    followers: bigint;
    maxEnergy: number;
    tapMultiplier: number;
    skinUnlock?: string;
  } | null;
}

@Injectable()
export class LevelService {
  constructor(
    @InjectRepository(Level)
    private levelRepository: Repository<Level>,
  ) {}

  async getAllLevels(): Promise<Level[]> {
    return this.levelRepository.find({
      order: { value: 'ASC' },
    });
  }

  async getLevelByValue(value: number): Promise<Level | null> {
    return this.levelRepository.findOne({ where: { value } });
  }

  async calculateLevel(followers: bigint): Promise<Level | null> {
    const level = await this.levelRepository
      .createQueryBuilder('level')
      .where('CAST(level.requiredFollowers AS BIGINT) <= CAST(:followers AS BIGINT)', {
        followers: followers.toString(),
      })
      .orderBy('level.value', 'DESC')
      .getOne();

    return level || (await this.getLevelByValue(1));
  }

  async getNextLevel(currentLevel: number): Promise<Level | null> {
    return this.levelRepository.findOne({
      where: { value: currentLevel + 1 },
    });
  }

  async checkLevelUp(user: User): Promise<LevelUpResult> {
    const newLevelData = await this.calculateLevel(user.followers);

    if (!newLevelData) {
      return {
        leveledUp: false,
        previousLevel: user.level,
        newLevel: user.level,
        rewards: null,
      };
    }

    if (newLevelData.value > user.level) {
      const rewards = {
        gems: 0,
        followers: BigInt(0),
        maxEnergy: newLevelData.maxEnergy,
        tapMultiplier: newLevelData.tapMultiplier,
        skinUnlock: newLevelData.skinUnlock || undefined,
      };

      // Accumulate rewards from all levels passed
      const levelsGained = await this.levelRepository.find({
        where: {
          value: MoreThan(user.level),
        },
        order: { value: 'ASC' },
      });

      for (const level of levelsGained) {
        if (level.value <= newLevelData.value) {
          rewards.gems += level.rewardGems;
          rewards.followers += level.rewardFollowers;
        }
      }

      return {
        leveledUp: true,
        previousLevel: user.level,
        newLevel: newLevelData.value,
        rewards,
      };
    }

    return {
      leveledUp: false,
      previousLevel: user.level,
      newLevel: user.level,
      rewards: null,
    };
  }

  async getProgressToNextLevel(
    user: User,
  ): Promise<{ current: bigint; required: bigint; percentage: number }> {
    const currentLevel = await this.getLevelByValue(user.level);
    const nextLevel = await this.getNextLevel(user.level);

    if (!nextLevel || !currentLevel) {
      return {
        current: user.followers,
        required: user.followers,
        percentage: 100,
      };
    }

    const currentThreshold = currentLevel.requiredFollowers;
    const nextThreshold = nextLevel.requiredFollowers;
    const progressInLevel = user.followers - currentThreshold;
    const levelRange = nextThreshold - currentThreshold;

    const percentage =
      levelRange > 0n
        ? Math.min(100, Number((progressInLevel * 100n) / levelRange))
        : 100;

    return {
      current: progressInLevel,
      required: levelRange,
      percentage,
    };
  }
}
