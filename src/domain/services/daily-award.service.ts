import { Injectable } from '@nestjs/common';
import { DailyAwardConfig } from '../entities/daily-award-config.entity';

export interface DailyFollowersAwardResult {
  rawDelta: number;
  deltaFollowers: bigint;
  engagement: number;
  streak: number;
}

@Injectable()
export class DailyAwardService {
  calculateDailyFollowersGain(
    followersBalance: bigint,
    dailyEngagement: number,
    streak: number,
    config: DailyAwardConfig,
  ): DailyFollowersAwardResult {
    const S = this.toSafeNumber(followersBalance);
    const E = this.clamp(dailyEngagement, 0, 1);
    const d = Math.max(1, Math.floor(streak));

    const alpha = config.alpha;
    const beta = config.beta;
    const gamma = config.gamma;
    const maxStreakBonus = config.maxStreakBonus;
    const minDailyGain = this.toBigInt(config.minDailyGain, 1n);
    const maxDailyGain = this.toBigInt(config.maxDailyGain, 1000000n);

    const streakBonus = Math.min(beta * Math.log(d), maxStreakBonus);
    const rawDelta =
      Math.pow(Math.max(S, 0), alpha) * (1 + streakBonus) * Math.pow(E, gamma);
    const flooredDelta = BigInt(Math.max(0, Math.floor(rawDelta)));
    const deltaFollowers = this.clampBigInt(
      flooredDelta,
      minDailyGain,
      maxDailyGain,
    );

    return {
      rawDelta,
      deltaFollowers,
      engagement: E,
      streak: d,
    };
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  private clampBigInt(value: bigint, min: bigint, max: bigint): bigint {
    if (value < min) return min;
    if (value > max) return max;
    return value;
  }

  private toSafeNumber(value: bigint): number {
    const maxSafeBigInt = BigInt(Number.MAX_SAFE_INTEGER);
    if (value > maxSafeBigInt) {
      return Number.MAX_SAFE_INTEGER;
    }
    return Number(value);
  }

  private toBigInt(
    value: string | number | bigint | null | undefined,
    fallback: bigint,
  ): bigint {
    try {
      if (typeof value === 'bigint') return value;
      if (typeof value === 'number') return BigInt(Math.floor(value));
      if (typeof value === 'string') return BigInt(value);
      return fallback;
    } catch {
      return fallback;
    }
  }
}
