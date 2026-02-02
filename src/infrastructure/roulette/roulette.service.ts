import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import { User } from '../../domain/entities/user.entity';
import { RoulettePrize } from '../../domain/entities/roulette-prize.entity';
import { RouletteSpin } from '../../domain/entities/roulette-spin.entity';

const DAYS_FOR_ROULETTE = 7; // Days of consecutive login to unlock roulette

@Injectable()
export class RouletteService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(RoulettePrize)
    private prizeRepository: Repository<RoulettePrize>,
    @InjectRepository(RouletteSpin)
    private spinRepository: Repository<RouletteSpin>,
  ) {}

  async getStatus(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if user can spin today
    let canSpinToday = false;
    if (user.canSpinRoulette) {
      if (!user.lastRouletteSpinAt) {
        canSpinToday = true;
      } else {
        const lastSpinDate = new Date(user.lastRouletteSpinAt);
        lastSpinDate.setHours(0, 0, 0, 0);
        canSpinToday = lastSpinDate.getTime() < today.getTime();
      }
    }

    return {
      loginStreak: user.loginStreak,
      daysRequired: DAYS_FOR_ROULETTE,
      daysRemaining: Math.max(0, DAYS_FOR_ROULETTE - user.loginStreak),
      isUnlocked: user.canSpinRoulette,
      canSpinToday,
      lastSpinAt: user.lastRouletteSpinAt,
    };
  }

  async getPrizes() {
    const prizes = await this.prizeRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC' },
    });

    return prizes.map((prize) => ({
      id: prize.id,
      name: prize.name,
      description: prize.description,
      type: prize.type,
      imageUrl: prize.imageUrl,
      color: prize.color,
      isExclusive: prize.isExclusive,
    }));
  }

  async spin(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (!user.canSpinRoulette) {
      throw new BadRequestException(
        `You need ${DAYS_FOR_ROULETTE} consecutive login days to unlock the roulette`,
      );
    }

    // Check if already spun today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (user.lastRouletteSpinAt) {
      const lastSpinDate = new Date(user.lastRouletteSpinAt);
      lastSpinDate.setHours(0, 0, 0, 0);

      if (lastSpinDate.getTime() >= today.getTime()) {
        throw new BadRequestException('You already spun the roulette today');
      }
    }

    // Get all active prizes with their probabilities
    const prizes = await this.prizeRepository.find({
      where: { isActive: true },
    });

    if (prizes.length === 0) {
      throw new BadRequestException('No prizes available');
    }

    // Select a prize based on probability weights
    const selectedPrize = this.selectPrizeByWeight(prizes);

    // Apply the reward
    const rewardClaimed = await this.applyReward(user, selectedPrize);

    // Update user's last spin time
    user.lastRouletteSpinAt = new Date();
    await this.userRepository.save(user);

    // Save the spin record
    const spin = this.spinRepository.create({
      userId: user.id,
      prizeId: selectedPrize.id,
      rewardClaimed,
      loginStreakAtSpin: user.loginStreak,
    });
    await this.spinRepository.save(spin);

    return {
      prize: {
        id: selectedPrize.id,
        name: selectedPrize.name,
        description: selectedPrize.description,
        type: selectedPrize.type,
        imageUrl: selectedPrize.imageUrl,
        color: selectedPrize.color,
      },
      reward: rewardClaimed,
      spinId: spin.id,
    };
  }

  async getHistory(userId: string, limit = 10) {
    const spins = await this.spinRepository.find({
      where: { userId },
      relations: ['prize'],
      order: { createdAt: 'DESC' },
      take: limit,
    });

    return spins.map((spin) => ({
      id: spin.id,
      prize: {
        id: spin.prize.id,
        name: spin.prize.name,
        type: spin.prize.type,
        imageUrl: spin.prize.imageUrl,
      },
      reward: spin.rewardClaimed,
      loginStreakAtSpin: spin.loginStreakAtSpin,
      createdAt: spin.createdAt,
    }));
  }

  @OnEvent('user.login')
  async handleUserLogin(payload: { userId: string }) {
    await this.updateLoginStreak(payload.userId);
  }

  async updateLoginStreak(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let newStreak = 1;

    if (user.lastStreakDate) {
      const lastStreakDate = new Date(user.lastStreakDate);
      lastStreakDate.setHours(0, 0, 0, 0);

      // If last streak was yesterday, increment
      if (lastStreakDate.getTime() === yesterday.getTime()) {
        newStreak = user.loginStreak + 1;
      }
      // If last streak was today, don't change
      else if (lastStreakDate.getTime() === today.getTime()) {
        return; // Already logged in today
      }
      // Otherwise, reset to 1
    }

    user.loginStreak = newStreak;
    user.lastStreakDate = new Date();

    // Check if user unlocked roulette
    if (newStreak >= DAYS_FOR_ROULETTE && !user.canSpinRoulette) {
      user.canSpinRoulette = true;
    }

    await this.userRepository.save(user);
  }

  private selectPrizeByWeight(prizes: RoulettePrize[]): RoulettePrize {
    const totalWeight = prizes.reduce((sum, prize) => sum + prize.probability, 0);
    let random = Math.random() * totalWeight;

    for (const prize of prizes) {
      random -= prize.probability;
      if (random <= 0) {
        return prize;
      }
    }

    return prizes[prizes.length - 1];
  }

  private async applyReward(
    user: User,
    prize: RoulettePrize,
  ): Promise<{ followers?: number; gems?: number; energy?: number }> {
    const reward: { followers?: number; gems?: number; energy?: number } = {};

    if (prize.reward?.followers) {
      user.followers = BigInt(user.followers) + BigInt(prize.reward.followers);
      reward.followers = prize.reward.followers;
    }

    if (prize.reward?.gems) {
      user.gems += prize.reward.gems;
      reward.gems = prize.reward.gems;
    }

    if (prize.reward?.energy) {
      user.energy = Math.min(user.energy + prize.reward.energy, user.maxEnergy);
      reward.energy = prize.reward.energy;
    }

    // TODO: Handle booster and cosmetic rewards

    await this.userRepository.save(user);

    return reward;
  }
}
