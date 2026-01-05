import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User } from '../../domain/entities/user.entity';
import {
  LevelService,
  LevelUpResult,
} from '../../domain/services/level.service';

@Injectable()
export class CheckLevelUpUseCase {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private levelService: LevelService,
    private eventEmitter: EventEmitter2,
  ) {}

  async execute(userId: string): Promise<LevelUpResult> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const result = await this.levelService.checkLevelUp(user);

    if (result.leveledUp && result.rewards) {
      // Update user with new level stats
      user.level = result.newLevel;
      user.maxEnergy = result.rewards.maxEnergy;
      user.tapMultiplier = result.rewards.tapMultiplier;
      user.gems += result.rewards.gems;
      user.followers += result.rewards.followers;

      await this.userRepository.save(user);

      // Emit level up event for mission tracking
      this.eventEmitter.emit('game.levelUp', {
        userId: user.id,
        previousLevel: result.previousLevel,
        newLevel: result.newLevel,
        rewards: result.rewards,
      });
    }

    return result;
  }
}
