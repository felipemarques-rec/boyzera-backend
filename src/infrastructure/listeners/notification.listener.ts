import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CreateNotificationUseCase } from '../../use-cases/notification/create-notification.use-case';

@Injectable()
export class NotificationListener {
  constructor(private createNotificationUseCase: CreateNotificationUseCase) {}

  @OnEvent('game.levelUp')
  async handleLevelUpEvent(payload: {
    userId: string;
    previousLevel: number;
    newLevel: number;
    rewards: { gems: number; followers: bigint };
  }): Promise<void> {
    await this.createNotificationUseCase.createLevelUpNotification(
      payload.userId,
      payload.newLevel,
      {
        gems: payload.rewards.gems,
        followers: payload.rewards.followers.toString(),
      },
    );
  }

  @OnEvent('mission.completed')
  async handleMissionCompleteEvent(payload: {
    userId: string;
    missionId: string;
    missionTitle: string;
    reward: any;
  }): Promise<void> {
    await this.createNotificationUseCase.createMissionCompleteNotification(
      payload.userId,
      payload.missionTitle,
      payload.reward,
    );
  }

  @OnEvent('referral.new')
  async handleReferralEvent(payload: {
    userId: string;
    referredUserId: string;
    totalReferrals: number;
  }): Promise<void> {
    // Notification for the referrer
    await this.createNotificationUseCase.createReferralBonusNotification(
      payload.userId,
      '', // We don't have username here, could enhance
      '1000', // Default bonus
    );
  }
}
