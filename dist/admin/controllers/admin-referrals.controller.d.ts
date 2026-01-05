import { Repository } from 'typeorm';
import { Referral } from '../../domain/entities/referral.entity';
import { User } from '../../domain/entities/user.entity';
export declare class AdminReferralsController {
    private referralRepository;
    private userRepository;
    constructor(referralRepository: Repository<Referral>, userRepository: Repository<User>);
    getReferrals(page?: number, limit?: number, search?: string, sortBy?: string, sortOrder?: 'ASC' | 'DESC'): Promise<{
        data: {
            id: string;
            referrer: {
                id: string;
                username: string;
                firstName: string;
                lastName: string;
            } | null;
            referred: {
                id: string;
                username: string;
                firstName: string;
                lastName: string;
            } | null;
            totalEarnedFollowers: string;
            bonusClaimed: boolean;
            createdAt: Date;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getStats(): Promise<{
        total: number;
        bonusClaimed: number;
        bonusPending: number;
        todayReferrals: number;
        topReferrers: {
            userId: any;
            username: string | undefined;
            firstName: string | undefined;
            referralCount: number;
            totalEarned: any;
        }[];
    }>;
    getUserReferrals(userId: string): Promise<{
        user: {
            id: string;
            username: string;
            firstName: string;
        } | null;
        referralCount: number;
        referrals: {
            id: string;
            referred: {
                id: string;
                username: string;
                firstName: string;
            } | null;
            totalEarnedFollowers: string;
            bonusClaimed: boolean;
            createdAt: Date;
        }[];
    }>;
}
