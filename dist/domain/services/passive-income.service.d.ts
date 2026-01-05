import { ConfigService } from '@nestjs/config';
import { User } from '../entities/user.entity';
export interface PassiveIncomeResult {
    earnedFollowers: bigint;
    hoursOffline: number;
    cappedHours: number;
    wasCollected: boolean;
}
export declare class PassiveIncomeService {
    private configService;
    private readonly maxOfflineHours;
    constructor(configService: ConfigService);
    calculatePassiveIncome(user: User): PassiveIncomeResult;
    getPotentialEarnings(user: User, hours: number): bigint;
    getMaxOfflineHours(): number;
    getHourlyRate(user: User): number;
    formatEarnings(followers: bigint): string;
}
