import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User } from '../../domain/entities/user.entity';
import {
  Upgrade,
  UpgradeEffectType,
} from '../../domain/entities/upgrade.entity';
import { UserUpgrade } from '../../domain/entities/user-upgrade.entity';
import { RedisService } from '../../infrastructure/redis/redis.service';

export interface BuyUpgradeResult {
  success: boolean;
  upgrade: Upgrade;
  newLevel: number;
  cost: string;
  effect: number;
  newFollowers: string;
}

@Injectable()
export class BuyUpgradeUseCase {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Upgrade)
    private upgradeRepository: Repository<Upgrade>,
    @InjectRepository(UserUpgrade)
    private userUpgradeRepository: Repository<UserUpgrade>,
    @InjectDataSource()
    private dataSource: DataSource,
    private redisService: RedisService,
    private eventEmitter: EventEmitter2,
  ) {}

  async execute(userId: string, upgradeId: string): Promise<BuyUpgradeResult> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
      });
      const upgrade = await queryRunner.manager.findOne(Upgrade, {
        where: { id: upgradeId },
      });

      if (!user || !upgrade) {
        throw new BadRequestException('User or Upgrade not found');
      }

      if (!upgrade.isActive) {
        throw new BadRequestException('Upgrade is not available');
      }

      if (user.level < upgrade.requiredLevel) {
        throw new BadRequestException(
          `Requires level ${upgrade.requiredLevel}. Current level: ${user.level}`,
        );
      }

      let userUpgrade = await queryRunner.manager.findOne(UserUpgrade, {
        where: { userId, upgradeId },
      });

      const currentLevel = userUpgrade ? userUpgrade.level : 0;

      if (currentLevel >= upgrade.maxLevel) {
        throw new BadRequestException('Upgrade is at max level');
      }

      const cost = upgrade.getCostAtLevel(currentLevel);
      const effect = upgrade.getEffectAtLevel(currentLevel + 1);

      if (user.followers < cost) {
        throw new BadRequestException(
          `Insufficient funds. Need: ${cost}, Have: ${user.followers}`,
        );
      }

      // Deduct cost
      user.followers = user.followers - cost;

      // Apply effect based on type
      switch (upgrade.effectType) {
        case UpgradeEffectType.PASSIVE_INCOME:
          user.profitPerHour += effect;
          break;
        case UpgradeEffectType.TAP_MULTIPLIER:
          user.tapMultiplier += Math.floor(effect);
          break;
        case UpgradeEffectType.ENERGY_MAX:
          user.maxEnergy += Math.floor(effect);
          break;
        case UpgradeEffectType.ENERGY_REGEN:
          user.energyRegenRate += effect;
          break;
      }

      await queryRunner.manager.save(user);

      if (userUpgrade) {
        userUpgrade.level += 1;
        await queryRunner.manager.save(userUpgrade);
      } else {
        userUpgrade = queryRunner.manager.create(UserUpgrade, {
          userId,
          upgradeId,
          level: 1,
        });
        await queryRunner.manager.save(userUpgrade);
      }

      await queryRunner.commitTransaction();

      // Update leaderboard in Redis
      await this.redisService.zadd(
        'leaderboard:global',
        Number(user.followers),
        user.id,
      );

      // Emit upgrade event
      this.eventEmitter.emit('game.upgrade', {
        userId: user.id,
        upgradeId: upgrade.id,
        upgradeName: upgrade.name,
        newLevel: userUpgrade.level,
        cost: cost.toString(),
        effect,
      });

      return {
        success: true,
        upgrade,
        newLevel: userUpgrade.level,
        cost: cost.toString(),
        effect,
        newFollowers: user.followers.toString(),
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
