import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UpdateMissionProgressUseCase } from '../../use-cases/mission/update-mission-progress.use-case';
import { MissionRequirementType } from '../../domain/entities/mission.entity';

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

@Injectable()
export class MissionListener {
  constructor(
    private updateMissionProgressUseCase: UpdateMissionProgressUseCase,
  ) {}

  @OnEvent('game.tap')
  async handleTapEvent(payload: TapEvent): Promise<void> {
    const { userId, tapCount, totalFollowers, combo } = payload;

    // Update tap count missions
    await this.updateMissionProgressUseCase.execute(
      userId,
      MissionRequirementType.TAP_COUNT,
      tapCount,
    );

    // Update follower count missions (absolute value)
    await this.updateMissionProgressUseCase.execute(
      userId,
      MissionRequirementType.FOLLOWER_COUNT,
      0,
      Number(totalFollowers),
    );

    // Update combo missions (absolute value)
    await this.updateMissionProgressUseCase.execute(
      userId,
      MissionRequirementType.COMBO_REACH,
      0,
      combo,
    );
  }

  @OnEvent('game.levelUp')
  async handleLevelUpEvent(payload: LevelUpEvent): Promise<void> {
    const { userId, newLevel } = payload;

    // Update level missions (absolute value)
    await this.updateMissionProgressUseCase.execute(
      userId,
      MissionRequirementType.LEVEL_REACH,
      0,
      newLevel,
    );
  }

  @OnEvent('game.upgrade')
  async handleUpgradeEvent(payload: UpgradeEvent): Promise<void> {
    const { userId } = payload;

    // Update upgrade purchase missions
    await this.updateMissionProgressUseCase.execute(
      userId,
      MissionRequirementType.UPGRADE_BUY,
      1,
    );
  }

  @OnEvent('referral.new')
  async handleReferralEvent(payload: ReferralEvent): Promise<void> {
    const { userId, totalReferrals } = payload;

    // Update referral missions (absolute value)
    await this.updateMissionProgressUseCase.execute(
      userId,
      MissionRequirementType.REFERRAL_COUNT,
      0,
      totalReferrals,
    );
  }

  @OnEvent('challenge.completed')
  async handleChallengeEvent(payload: ChallengeEvent): Promise<void> {
    const { userId, won, totalWins } = payload;

    if (won) {
      // Update challenge win missions
      await this.updateMissionProgressUseCase.execute(
        userId,
        MissionRequirementType.CHALLENGE_WIN,
        0,
        totalWins,
      );
    }
  }

  @OnEvent('user.login')
  async handleLoginEvent(payload: {
    userId: string;
    streak: number;
  }): Promise<void> {
    const { userId, streak } = payload;

    // Update login streak missions
    await this.updateMissionProgressUseCase.execute(
      userId,
      MissionRequirementType.LOGIN_STREAK,
      0,
      streak,
    );
  }

  @OnEvent('ad.watched')
  async handleAdWatchedEvent(payload: { userId: string }): Promise<void> {
    const { userId } = payload;

    // Update watch ads missions
    await this.updateMissionProgressUseCase.execute(
      userId,
      MissionRequirementType.WATCH_ADS,
      1,
    );
  }

  @OnEvent('collab.completed')
  async handleCollabEvent(payload: { userId: string }): Promise<void> {
    const { userId } = payload;

    // Update collab missions
    await this.updateMissionProgressUseCase.execute(
      userId,
      MissionRequirementType.COLLAB_COMPLETE,
      1,
    );
  }
}
