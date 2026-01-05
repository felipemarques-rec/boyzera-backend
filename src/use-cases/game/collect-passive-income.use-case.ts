import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User } from '../../domain/entities/user.entity';
import {
  PassiveIncomeService,
  PassiveIncomeResult,
} from '../../domain/services/passive-income.service';
import { RedisService } from '../../infrastructure/redis/redis.service';

export interface CollectIncomeResponse extends PassiveIncomeResult {
  newTotalFollowers: bigint;
}

@Injectable()
export class CollectPassiveIncomeUseCase {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private passiveIncomeService: PassiveIncomeService,
    private redisService: RedisService,
    private eventEmitter: EventEmitter2,
  ) {}

  async execute(userId: string): Promise<CollectIncomeResponse> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const incomeResult = this.passiveIncomeService.calculatePassiveIncome(user);

    if (incomeResult.wasCollected) {
      // Update user followers
      user.followers += incomeResult.earnedFollowers;
      user.lastLoginAt = new Date();

      await this.userRepository.save(user);

      // Update Redis leaderboard
      await this.redisService.zadd(
        'leaderboard:global',
        Number(user.followers),
        user.id,
      );

      // Emit passive income event
      this.eventEmitter.emit('game.passiveIncome', {
        userId: user.id,
        earnedFollowers: incomeResult.earnedFollowers,
        hoursOffline: incomeResult.cappedHours,
      });
    } else {
      // Just update last login time
      user.lastLoginAt = new Date();
      await this.userRepository.save(user);
    }

    return {
      ...incomeResult,
      newTotalFollowers: user.followers,
    };
  }
}
