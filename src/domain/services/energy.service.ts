import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';

export interface EnergyState {
  currentEnergy: number;
  maxEnergy: number;
  lastUpdate: Date;
  secondsUntilFull: number;
}

@Injectable()
export class EnergyService {
  calculateCurrentEnergy(user: User): EnergyState {
    const now = new Date();
    const lastUpdate = user.lastEnergyUpdate || user.createdAt || now;

    // Ensure we have valid numbers
    const currentStoredEnergy = Number(user.energy) || 0;
    const maxEnergy = Number(user.maxEnergy) || 1000;
    const regenRate = Number(user.energyRegenRate) || 1;

    // Calculate elapsed time safely
    const lastUpdateTime = new Date(lastUpdate).getTime();
    const elapsedMs = now.getTime() - lastUpdateTime;
    const elapsedSeconds = Math.max(0, Math.floor(elapsedMs / 1000));

    // Calculate regenerated energy
    const regenerated = Math.floor(elapsedSeconds * regenRate);

    // Ensure energy is never negative and capped at max
    const baseEnergy = Math.max(0, currentStoredEnergy);
    const newEnergy = Math.min(baseEnergy + regenerated, maxEnergy);

    // Calculate time until full
    const energyNeeded = maxEnergy - newEnergy;
    const secondsUntilFull =
      energyNeeded > 0 ? Math.ceil(energyNeeded / regenRate) : 0;

    return {
      currentEnergy: newEnergy,
      maxEnergy: maxEnergy,
      lastUpdate: now,
      secondsUntilFull,
    };
  }

  canTap(user: User, tapCount: number = 1): boolean {
    const { currentEnergy } = this.calculateCurrentEnergy(user);
    return currentEnergy >= tapCount;
  }

  consumeEnergy(
    user: User,
    amount: number,
  ): { newEnergy: number; lastUpdate: Date } {
    const { currentEnergy } = this.calculateCurrentEnergy(user);
    const newEnergy = Math.max(0, currentEnergy - amount);

    return {
      newEnergy,
      lastUpdate: new Date(),
    };
  }

  getRegenTimeForEnergy(
    user: User,
    energyNeeded: number,
  ): { seconds: number; readableTime: string } {
    const seconds = Math.ceil(energyNeeded / user.energyRegenRate);

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    let readableTime = '';
    if (hours > 0) readableTime += `${hours}h `;
    if (minutes > 0) readableTime += `${minutes}m `;
    if (secs > 0 || readableTime === '') readableTime += `${secs}s`;

    return { seconds, readableTime: readableTime.trim() };
  }
}
