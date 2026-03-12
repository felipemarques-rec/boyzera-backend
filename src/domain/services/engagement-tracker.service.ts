import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import { User } from '../entities/user.entity';

/**
 * Pesos de engajamento por tipo de ação.
 * O total acumulado é normalizado para 0-1 pelo teto MAX_DAILY_ENGAGEMENT_POINTS.
 */
const ENGAGEMENT_WEIGHTS = {
  TAP: 0.001,
  MISSION_COMPLETED: 0.15,
  MISSION_REWARD_CLAIMED: 0.05,
  CHALLENGE_COMPLETED: 0.12,
  COLLAB_COMPLETED: 0.10,
  MINIGAME_COMPLETED: 0.08,
  UPGRADE_BOUGHT: 0.05,
  AD_WATCHED: 0.03,
};

const MAX_DAILY_ENGAGEMENT_POINTS = 1.0;

@Injectable()
export class EngagementTrackerService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  private async addEngagement(userId: string, weight: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) return;

    const current = Number(user.dailyEngagement) || 0;
    const newValue = Math.min(current + weight, MAX_DAILY_ENGAGEMENT_POINTS);

    await this.userRepository.update(userId, {
      dailyEngagement: parseFloat(newValue.toFixed(6)),
    });
  }

  @OnEvent('game.tap')
  async handleTap(payload: { userId: string; tapCount: number }): Promise<void> {
    const weight = ENGAGEMENT_WEIGHTS.TAP * payload.tapCount;
    await this.addEngagement(payload.userId, weight);
  }

  @OnEvent('mission.completed')
  async handleMissionCompleted(payload: { userId: string }): Promise<void> {
    await this.addEngagement(payload.userId, ENGAGEMENT_WEIGHTS.MISSION_COMPLETED);
  }

  @OnEvent('mission.rewardClaimed')
  async handleMissionRewardClaimed(payload: { userId: string }): Promise<void> {
    await this.addEngagement(payload.userId, ENGAGEMENT_WEIGHTS.MISSION_REWARD_CLAIMED);
  }

  @OnEvent('challenge.completed')
  async handleChallengeCompleted(payload: { userId: string }): Promise<void> {
    await this.addEngagement(payload.userId, ENGAGEMENT_WEIGHTS.CHALLENGE_COMPLETED);
  }

  @OnEvent('collab.completed')
  async handleCollabCompleted(payload: { userId: string }): Promise<void> {
    await this.addEngagement(payload.userId, ENGAGEMENT_WEIGHTS.COLLAB_COMPLETED);
  }

  @OnEvent('minigame.completed')
  async handleMinigameCompleted(payload: { userId: string }): Promise<void> {
    await this.addEngagement(payload.userId, ENGAGEMENT_WEIGHTS.MINIGAME_COMPLETED);
  }

  @OnEvent('game.upgrade')
  async handleUpgradeBought(payload: { userId: string }): Promise<void> {
    await this.addEngagement(payload.userId, ENGAGEMENT_WEIGHTS.UPGRADE_BOUGHT);
  }

  @OnEvent('ad.watched')
  async handleAdWatched(payload: { userId: string }): Promise<void> {
    await this.addEngagement(payload.userId, ENGAGEMENT_WEIGHTS.AD_WATCHED);
  }
}
