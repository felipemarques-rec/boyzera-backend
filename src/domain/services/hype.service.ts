import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { HypeConfig } from '../entities/hype-config.entity';

export interface HypeCalculationResult {
  previousHype: number;
  newHype: number;
  deltaHype: number;
  type: 'gain' | 'decay';
  decayReason?:
    | 'low_engagement'
    | 'missed_1_day'
    | 'missed_2_days'
    | 'missed_3plus_days';
}

@Injectable()
export class HypeService {
  /**
   * Daily gain:
   * deltaH = (1 - H) * E^gamma * min(beta * ln(d), C_h)
   * deltaH = max(deltaH, minDailyGain)
   * H_new = min(H + deltaH, 1)
   */
  calculateDailyHypeGain(
    user: User,
    config: HypeConfig,
  ): HypeCalculationResult {
    const H = this.clampHype(Number(user.hype) || 0);
    const E = Math.max(0, Math.min(1, Number(user.dailyEngagement) || 0));
    const d = Math.max(1, Number(user.loginStreak) || 1);

    const { beta, gamma, maxStreakBonus, minDailyGain } = config;

    const headroom = 1 - H;
    const engagementFactor = Math.pow(E, gamma);
    const streakBonus = Math.min(beta * Math.log(d), maxStreakBonus);

    let deltaH = headroom * engagementFactor * streakBonus;
    deltaH = Math.max(deltaH, minDailyGain);

    const newHype = this.clampHype(H + deltaH);

    return {
      previousHype: H,
      newHype,
      deltaHype: newHype - H,
      type: 'gain',
    };
  }

  /**
   * Decay:
   * H_new = H - delta * H
   */
  calculateHypeDecay(
    user: User,
    config: HypeConfig,
    daysMissed: number,
  ): HypeCalculationResult {
    const H = this.clampHype(Number(user.hype) || 0);

    let delta: number;
    let reason: HypeCalculationResult['decayReason'];

    if (daysMissed >= 3) {
      delta = config.decayHeavy;
      reason = 'missed_3plus_days';
    } else if (daysMissed === 2) {
      delta = config.decayNormal;
      reason = 'missed_2_days';
    } else if (daysMissed === 1) {
      delta = config.decayLight;
      reason = 'missed_1_day';
    } else {
      delta = config.decayLight;
      reason = 'low_engagement';
    }

    const decay = delta * H;
    const newHype = this.clampHype(H - decay);

    return {
      previousHype: H,
      newHype,
      deltaHype: -(H - newHype),
      type: 'decay',
      decayReason: reason,
    };
  }

  processDailyHype(
    user: User,
    config: HypeConfig,
    didLogin: boolean,
    daysMissed: number,
  ): HypeCalculationResult {
    const E = Number(user.dailyEngagement) || 0;

    if (didLogin && E >= config.minEngagementThreshold) {
      return this.calculateDailyHypeGain(user, config);
    }

    return this.calculateHypeDecay(user, config, didLogin ? 0 : daysMissed);
  }

  clampHype(value: number): number {
    return Math.max(0, Math.min(1, value));
  }
}
