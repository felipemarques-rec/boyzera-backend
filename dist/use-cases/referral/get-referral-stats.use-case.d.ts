import { Repository } from 'typeorm';
import { User } from '../../domain/entities/user.entity';
import { Referral } from '../../domain/entities/referral.entity';
export interface ReferralStats {
    totalReferrals: number;
    totalEarnedFollowers: string;
    referrals: ReferralInfo[];
    milestones: MilestoneInfo[];
}
export interface ReferralInfo {
    id: string;
    username: string | null;
    firstName: string | null;
    followers: string;
    earnedFromReferral: string;
    joinedAt: Date;
}
export interface MilestoneInfo {
    count: number;
    reward: {
        gems: number;
    };
    achieved: boolean;
}
export declare class GetReferralStatsUseCase {
    private userRepository;
    private referralRepository;
    private readonly milestones;
    constructor(userRepository: Repository<User>, referralRepository: Repository<Referral>);
    execute(userId: string): Promise<ReferralStats>;
    getReferralLeaderboard(limit?: number): Promise<{
        userId: string;
        count: number;
        username: string | null;
    }[]>;
}
