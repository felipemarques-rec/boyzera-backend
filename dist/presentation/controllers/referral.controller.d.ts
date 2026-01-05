import { GetReferralLinkUseCase } from '../../use-cases/referral/get-referral-link.use-case';
import { ProcessReferralUseCase } from '../../use-cases/referral/process-referral.use-case';
import { GetReferralStatsUseCase } from '../../use-cases/referral/get-referral-stats.use-case';
declare class ProcessReferralDto {
    referralCode: string;
}
export declare class ReferralController {
    private getReferralLinkUseCase;
    private processReferralUseCase;
    private getReferralStatsUseCase;
    constructor(getReferralLinkUseCase: GetReferralLinkUseCase, processReferralUseCase: ProcessReferralUseCase, getReferralStatsUseCase: GetReferralStatsUseCase);
    getReferralLink(req: any): Promise<import("../../use-cases/referral/get-referral-link.use-case").ReferralLinkResult>;
    getReferralStats(req: any): Promise<import("../../use-cases/referral/get-referral-stats.use-case").ReferralStats>;
    getReferralLeaderboard(limit?: number): Promise<{
        userId: string;
        count: number;
        username: string | null;
    }[]>;
    processReferral(req: any, dto: ProcessReferralDto): Promise<import("../../use-cases/referral/process-referral.use-case").ProcessReferralResult>;
}
export {};
