import { UpdateMissionProgressUseCase } from '../../use-cases/mission/update-mission-progress.use-case';
interface TapEvent {
    userId: string;
    tapCount: number;
    followersEarned: bigint;
    totalFollowers: bigint;
    combo: number;
}
interface LevelUpEvent {
    userId: string;
    previousLevel: number;
    newLevel: number;
    rewards: any;
}
interface UpgradeEvent {
    userId: string;
    upgradeId: string;
    upgradeName: string;
    newLevel: number;
    cost: string;
    effect: number;
}
interface ReferralEvent {
    userId: string;
    referredUserId: string;
    totalReferrals: number;
}
interface ChallengeEvent {
    userId: string;
    challengeId: string;
    won: boolean;
    totalWins: number;
}
export declare class MissionListener {
    private updateMissionProgressUseCase;
    constructor(updateMissionProgressUseCase: UpdateMissionProgressUseCase);
    handleTapEvent(payload: TapEvent): Promise<void>;
    handleLevelUpEvent(payload: LevelUpEvent): Promise<void>;
    handleUpgradeEvent(payload: UpgradeEvent): Promise<void>;
    handleReferralEvent(payload: ReferralEvent): Promise<void>;
    handleChallengeEvent(payload: ChallengeEvent): Promise<void>;
    handleLoginEvent(payload: {
        userId: string;
        streak: number;
    }): Promise<void>;
    handleAdWatchedEvent(payload: {
        userId: string;
    }): Promise<void>;
    handleCollabEvent(payload: {
        userId: string;
    }): Promise<void>;
}
export {};
