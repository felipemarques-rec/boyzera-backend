import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '../entities/user.entity';

export interface PassiveIncomeResult {
  earnedFollowers: bigint;
  hoursOffline: number;
  cappedHours: number;
  wasCollected: boolean;
}

@Injectable()
export class PassiveIncomeService {
  private readonly maxOfflineHours: number;

  constructor(private configService: ConfigService) {
    this.maxOfflineHours = this.configService.get<number>(
      'OFFLINE_MAX_HOURS',
      3,
    );
  }

  calculatePassiveIncome(user: User, bonusFollowersPerHour: number = 0): PassiveIncomeResult {
    const totalRate = user.profitPerHour + bonusFollowersPerHour;
    if (totalRate <= 0) {
      return {
        earnedFollowers: BigInt(0),
        hoursOffline: 0,
        cappedHours: 0,
        wasCollected: false,
      };
    }

    const now = new Date();
    const lastLogin = user.lastLoginAt || user.createdAt;
    const hoursOffline =
      (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60);

    // Cap at maximum offline hours
    const cappedHours = Math.min(hoursOffline, this.maxOfflineHours);

    // Calculate earned followers (base + equipped item bonuses)
    const earnedFollowers = BigInt(
      Math.floor(cappedHours * totalRate),
    );

    return {
      earnedFollowers,
      hoursOffline,
      cappedHours,
      wasCollected: earnedFollowers > 0n,
    };
  }

  getPotentialEarnings(user: User, hours: number): bigint {
    if (user.profitPerHour <= 0) {
      return BigInt(0);
    }

    const cappedHours = Math.min(hours, this.maxOfflineHours);
    return BigInt(Math.floor(cappedHours * user.profitPerHour));
  }

  getMaxOfflineHours(): number {
    return this.maxOfflineHours;
  }

  getHourlyRate(user: User): number {
    return user.profitPerHour;
  }

  formatEarnings(followers: bigint): string {
    const num = Number(followers);

    if (num >= 1_000_000_000) {
      return `${(num / 1_000_000_000).toFixed(1)}B`;
    }
    if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(1)}M`;
    }
    if (num >= 1_000) {
      return `${(num / 1_000).toFixed(1)}K`;
    }
    return num.toString();
  }
}
