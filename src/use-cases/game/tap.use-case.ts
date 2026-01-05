import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { User } from '../../domain/entities/user.entity';
import { EnergyService } from '../../domain/services/energy.service';
import { LevelService } from '../../domain/services/level.service';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { BatchTapDto, TapResponseDto } from '../../presentation/dtos/tap.dto';

@Injectable()
export class TapUseCase {
  private readonly maxTapsPerSecond: number;
  private readonly comboTimeoutMs: number;
  private readonly maxComboMultiplier: number;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private energyService: EnergyService,
    private levelService: LevelService,
    private redisService: RedisService,
    private eventEmitter: EventEmitter2,
    private configService: ConfigService,
  ) {
    this.maxTapsPerSecond = this.configService.get<number>(
      'MAX_TAPS_PER_SECOND',
      20,
    );
    this.comboTimeoutMs = this.configService.get<number>(
      'COMBO_TIMEOUT_MS',
      1000,
    );
    this.maxComboMultiplier = this.configService.get<number>(
      'COMBO_MAX_MULTIPLIER',
      5,
    );
  }

  async execute(userId: string, dto?: BatchTapDto): Promise<TapResponseDto> {
    const tapCount = dto?.taps || 1;

    // Validate tap count
    if (tapCount < 1 || tapCount > this.maxTapsPerSecond) {
      throw new BadRequestException(
        `Invalid tap count. Must be between 1 and ${this.maxTapsPerSecond}`,
      );
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.isBanned) {
      throw new BadRequestException('User is banned');
    }

    // Calculate current energy with regeneration
    const energyState = this.energyService.calculateCurrentEnergy(user);

    if (energyState.currentEnergy < tapCount) {
      throw new BadRequestException(
        `Not enough energy. Current: ${energyState.currentEnergy}, Required: ${tapCount}`,
      );
    }

    // Calculate combo
    const now = new Date();
    let combo = user.combo || 0;
    const lastTap = user.lastTapAt;

    if (lastTap) {
      const timeSinceLastTap = now.getTime() - lastTap.getTime();
      if (timeSinceLastTap <= this.comboTimeoutMs) {
        combo = Math.min(combo + tapCount, 100); // Max combo of 100
      } else {
        combo = tapCount; // Reset combo
      }
    } else {
      combo = tapCount;
    }

    // Calculate combo multiplier (1.0 to maxComboMultiplier based on combo)
    const comboMultiplier = Math.min(
      1 + (combo / 100) * (this.maxComboMultiplier - 1),
      this.maxComboMultiplier,
    );

    // Calculate followers earned
    const baseFollowersPerTap = user.tapMultiplier;
    const followersPerTap = Math.floor(baseFollowersPerTap * comboMultiplier);
    const totalFollowersEarned = BigInt(followersPerTap * tapCount);

    // Update user
    user.followers += totalFollowersEarned;
    user.energy = energyState.currentEnergy - tapCount;
    user.lastEnergyUpdate = now;
    user.totalTaps += BigInt(tapCount);
    user.combo = combo;
    user.lastTapAt = now;

    // Check for level up
    const levelUpResult = await this.levelService.checkLevelUp(user);
    if (levelUpResult.leveledUp && levelUpResult.rewards) {
      user.level = levelUpResult.newLevel;
      user.maxEnergy = levelUpResult.rewards.maxEnergy;
      user.tapMultiplier = levelUpResult.rewards.tapMultiplier;
      user.gems += levelUpResult.rewards.gems;
      user.followers += levelUpResult.rewards.followers;
    }

    await this.userRepository.save(user);

    // Update Redis leaderboard (async, don't wait)
    this.redisService
      .zadd('leaderboard:global', Number(user.followers), user.id)
      .catch((err) => console.error('Failed to update leaderboard:', err));

    // Emit tap event for mission tracking
    this.eventEmitter.emit('game.tap', {
      userId: user.id,
      tapCount,
      followersEarned: totalFollowersEarned,
      totalFollowers: user.followers,
      combo,
    });

    // Emit level up event if applicable
    if (levelUpResult.leveledUp) {
      this.eventEmitter.emit('game.levelUp', {
        userId: user.id,
        previousLevel: levelUpResult.previousLevel,
        newLevel: levelUpResult.newLevel,
        rewards: levelUpResult.rewards,
      });
    }

    const response: TapResponseDto = {
      success: true,
      tapsProcessed: tapCount,
      followersEarned: totalFollowersEarned.toString(),
      totalFollowers: user.followers.toString(),
      energy: user.energy,
      maxEnergy: user.maxEnergy,
      combo: user.combo,
      comboMultiplier: Math.round(comboMultiplier * 100) / 100,
    };

    if (levelUpResult.leveledUp && levelUpResult.rewards) {
      response.levelUp = {
        previousLevel: levelUpResult.previousLevel,
        newLevel: levelUpResult.newLevel,
        rewards: {
          gems: levelUpResult.rewards.gems,
          followers: levelUpResult.rewards.followers.toString(),
        },
      };
    }

    return response;
  }

  // Simple tap for backwards compatibility
  async executeSingle(userId: string): Promise<TapResponseDto> {
    return this.execute(userId, { taps: 1 });
  }
}
