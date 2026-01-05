import { User } from './user.entity';
export declare class Referral {
    id: string;
    referrerId: string;
    referrer: User;
    referredId: string;
    referred: User;
    totalEarnedFollowers: bigint;
    bonusClaimed: boolean;
    createdAt: Date;
}
