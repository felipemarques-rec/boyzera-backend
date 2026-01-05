import { User } from '../entities/user.entity';
export interface EnergyState {
    currentEnergy: number;
    maxEnergy: number;
    lastUpdate: Date;
    secondsUntilFull: number;
}
export declare class EnergyService {
    calculateCurrentEnergy(user: User): EnergyState;
    canTap(user: User, tapCount?: number): boolean;
    consumeEnergy(user: User, amount: number): {
        newEnergy: number;
        lastUpdate: Date;
    };
    getRegenTimeForEnergy(user: User, energyNeeded: number): {
        seconds: number;
        readableTime: string;
    };
}
