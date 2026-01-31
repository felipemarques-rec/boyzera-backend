import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual, IsNull, Or } from 'typeorm';
import { User } from '../../domain/entities/user.entity';
import { Collaboration } from '../../domain/entities/collaboration.entity';
import { UserCollaboration, UserCollaborationStatus } from '../../domain/entities/user-collaboration.entity';
import { Interview } from '../../domain/entities/interview.entity';
import { UserInterview } from '../../domain/entities/user-interview.entity';
import { Podcast } from '../../domain/entities/podcast.entity';
import { UserPodcast } from '../../domain/entities/user-podcast.entity';

@Injectable()
export class SocialService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Collaboration)
    private collaborationRepository: Repository<Collaboration>,
    @InjectRepository(UserCollaboration)
    private userCollaborationRepository: Repository<UserCollaboration>,
    @InjectRepository(Interview)
    private interviewRepository: Repository<Interview>,
    @InjectRepository(UserInterview)
    private userInterviewRepository: Repository<UserInterview>,
    @InjectRepository(Podcast)
    private podcastRepository: Repository<Podcast>,
    @InjectRepository(UserPodcast)
    private userPodcastRepository: Repository<UserPodcast>,
  ) {}

  // ==================== COLLABORATIONS ====================

  async getCollaborations(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const now = new Date();
    const collaborations = await this.collaborationRepository.find({
      where: {
        isActive: true,
        requiredLevel: LessThanOrEqual(user.level),
      },
      order: { sortOrder: 'ASC' },
    });

    // Get user's participation status for each collaboration
    const userCollabs = await this.userCollaborationRepository.find({
      where: { userId },
    });

    const userCollabMap = new Map(
      userCollabs.map((uc) => [uc.collaborationId, uc]),
    );

    return collaborations.map((collab) => {
      const userCollab = userCollabMap.get(collab.id);
      return {
        ...this.formatCollaboration(collab),
        userStatus: userCollab?.status || null,
        canParticipate: !userCollab && (collab.maxParticipants === 0 || collab.currentParticipants < collab.maxParticipants),
      };
    });
  }

  async participateInCollaboration(userId: string, collaborationId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const collaboration = await this.collaborationRepository.findOne({
      where: { id: collaborationId },
    });
    if (!collaboration) throw new NotFoundException('Collaboration not found');

    if (!collaboration.isActive) {
      throw new BadRequestException('This collaboration is no longer active');
    }

    if (user.level < collaboration.requiredLevel) {
      throw new BadRequestException(`You need to be level ${collaboration.requiredLevel} to participate`);
    }

    // Check if already participating
    const existing = await this.userCollaborationRepository.findOne({
      where: { userId, collaborationId },
    });

    if (existing) {
      throw new BadRequestException('You are already participating in this collaboration');
    }

    // Check max participants
    if (collaboration.maxParticipants > 0 && collaboration.currentParticipants >= collaboration.maxParticipants) {
      throw new BadRequestException('This collaboration is full');
    }

    // Create participation
    const userCollab = this.userCollaborationRepository.create({
      userId,
      collaborationId,
      status: UserCollaborationStatus.IN_PROGRESS,
    });
    await this.userCollaborationRepository.save(userCollab);

    // Update participant count
    collaboration.currentParticipants += 1;
    await this.collaborationRepository.save(collaboration);

    return {
      success: true,
      message: 'Successfully joined collaboration',
      collaboration: this.formatCollaboration(collaboration),
    };
  }

  async completeCollaboration(userId: string, collaborationId: string) {
    const userCollab = await this.userCollaborationRepository.findOne({
      where: { userId, collaborationId },
      relations: ['collaboration'],
    });

    if (!userCollab) {
      throw new NotFoundException('Participation not found');
    }

    if (userCollab.status === UserCollaborationStatus.COMPLETED) {
      throw new BadRequestException('Collaboration already completed');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const collaboration = userCollab.collaboration;

    // Apply rewards
    const rewards: { followers?: number; gems?: number } = {};

    if (collaboration.followersReward) {
      user.followers = BigInt(user.followers) + BigInt(collaboration.followersReward);
      rewards.followers = Number(collaboration.followersReward);
    }

    if (collaboration.gemsReward) {
      user.gems += collaboration.gemsReward;
      rewards.gems = collaboration.gemsReward;
    }

    if (collaboration.engagementBonus) {
      user.engagement = Math.min(100, user.engagement + collaboration.engagementBonus);
    }

    await this.userRepository.save(user);

    // Update participation
    userCollab.status = UserCollaborationStatus.COMPLETED;
    userCollab.completedAt = new Date();
    userCollab.rewardsClaimed = rewards;
    await this.userCollaborationRepository.save(userCollab);

    return {
      success: true,
      message: 'Collaboration completed!',
      rewards,
    };
  }

  // ==================== INTERVIEWS ====================

  async getInterviews(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const now = new Date();
    const interviews = await this.interviewRepository.find({
      where: {
        isActive: true,
        requiredLevel: LessThanOrEqual(user.level),
      },
      order: { sortOrder: 'ASC' },
    });

    // Get user's participation
    const userInterviews = await this.userInterviewRepository.find({
      where: { userId },
    });

    const userInterviewMap = new Map(
      userInterviews.map((ui) => [ui.interviewId, ui]),
    );

    return interviews.map((interview) => {
      const userInterview = userInterviewMap.get(interview.id);
      return {
        ...this.formatInterview(interview),
        isCompleted: userInterview?.isCompleted || false,
        canParticipate: !userInterview,
      };
    });
  }

  async participateInInterview(userId: string, interviewId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const interview = await this.interviewRepository.findOne({
      where: { id: interviewId },
    });
    if (!interview) throw new NotFoundException('Interview not found');

    if (!interview.isActive) {
      throw new BadRequestException('This interview is no longer available');
    }

    if (user.level < interview.requiredLevel) {
      throw new BadRequestException(`You need to be level ${interview.requiredLevel} to participate`);
    }

    // Check if already participated
    const existing = await this.userInterviewRepository.findOne({
      where: { userId, interviewId },
    });

    if (existing) {
      throw new BadRequestException('You have already participated in this interview');
    }

    // Apply rewards immediately for interviews
    const rewards: { followers?: number; gems?: number } = {};

    if (interview.followersReward) {
      user.followers = BigInt(user.followers) + BigInt(interview.followersReward);
      rewards.followers = Number(interview.followersReward);
    }

    if (interview.gemsReward) {
      user.gems += interview.gemsReward;
      rewards.gems = interview.gemsReward;
    }

    if (interview.engagementChange) {
      user.engagement = Math.max(0, Math.min(100, user.engagement + interview.engagementChange));
    }

    await this.userRepository.save(user);

    // Create participation record
    const userInterview = this.userInterviewRepository.create({
      userId,
      interviewId,
      isCompleted: true,
      completedAt: new Date(),
      rewardsClaimed: rewards,
    });
    await this.userInterviewRepository.save(userInterview);

    return {
      success: true,
      message: 'Interview completed!',
      rewards,
      engagementChange: interview.engagementChange,
    };
  }

  // ==================== PODCASTS ====================

  async getPodcasts(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const podcasts = await this.podcastRepository.find({
      where: {
        isActive: true,
        requiredLevel: LessThanOrEqual(user.level),
      },
      order: { sortOrder: 'ASC' },
    });

    // Get user's participation
    const userPodcasts = await this.userPodcastRepository.find({
      where: { userId },
    });

    const userPodcastMap = new Map(
      userPodcasts.map((up) => [up.podcastId, up]),
    );

    return podcasts.map((podcast) => {
      const userPodcast = userPodcastMap.get(podcast.id);
      return {
        ...this.formatPodcast(podcast),
        isCompleted: userPodcast?.isCompleted || false,
        canParticipate: !userPodcast,
      };
    });
  }

  async participateInPodcast(userId: string, podcastId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const podcast = await this.podcastRepository.findOne({
      where: { id: podcastId },
    });
    if (!podcast) throw new NotFoundException('Podcast not found');

    if (!podcast.isActive) {
      throw new BadRequestException('This podcast is no longer available');
    }

    if (user.level < podcast.requiredLevel) {
      throw new BadRequestException(`You need to be level ${podcast.requiredLevel} to participate`);
    }

    // Check if already participated
    const existing = await this.userPodcastRepository.findOne({
      where: { userId, podcastId },
    });

    if (existing) {
      throw new BadRequestException('You have already participated in this podcast');
    }

    // Apply rewards
    const rewards: { followers?: number; gems?: number } = {};

    if (podcast.followersReward) {
      user.followers = BigInt(user.followers) + BigInt(podcast.followersReward);
      rewards.followers = Number(podcast.followersReward);
    }

    if (podcast.gemsReward) {
      user.gems += podcast.gemsReward;
      rewards.gems = podcast.gemsReward;
    }

    if (podcast.engagementChange) {
      user.engagement = Math.max(0, Math.min(100, user.engagement + podcast.engagementChange));
    }

    await this.userRepository.save(user);

    // Create participation record
    const userPodcast = this.userPodcastRepository.create({
      userId,
      podcastId,
      isCompleted: true,
      completedAt: new Date(),
      rewardsClaimed: rewards,
    });
    await this.userPodcastRepository.save(userPodcast);

    return {
      success: true,
      message: 'Podcast completed!',
      rewards,
      engagementChange: podcast.engagementChange,
    };
  }

  // ==================== HELPERS ====================

  private formatCollaboration(collab: Collaboration) {
    return {
      id: collab.id,
      title: collab.title,
      description: collab.description,
      type: collab.type,
      brandName: collab.brandName,
      brandLogo: collab.brandLogo,
      imageUrl: collab.imageUrl,
      followersReward: collab.followersReward.toString(),
      gemsReward: collab.gemsReward,
      engagementBonus: collab.engagementBonus,
      requiredLevel: collab.requiredLevel,
      durationMinutes: collab.durationMinutes,
      expiresAt: collab.expiresAt,
      maxParticipants: collab.maxParticipants,
      currentParticipants: collab.currentParticipants,
    };
  }

  private formatInterview(interview: Interview) {
    return {
      id: interview.id,
      title: interview.title,
      description: interview.description,
      type: interview.type,
      hostName: interview.hostName,
      hostAvatar: interview.hostAvatar,
      channelName: interview.channelName,
      imageUrl: interview.imageUrl,
      followersReward: interview.followersReward.toString(),
      gemsReward: interview.gemsReward,
      engagementChange: interview.engagementChange,
      requiredLevel: interview.requiredLevel,
    };
  }

  private formatPodcast(podcast: Podcast) {
    return {
      id: podcast.id,
      title: podcast.title,
      description: podcast.description,
      category: podcast.category,
      hostName: podcast.hostName,
      hostAvatar: podcast.hostAvatar,
      podcastName: podcast.podcastName,
      imageUrl: podcast.imageUrl,
      audioUrl: podcast.audioUrl,
      durationMinutes: podcast.durationMinutes,
      followersReward: podcast.followersReward.toString(),
      gemsReward: podcast.gemsReward,
      engagementChange: podcast.engagementChange,
      requiredLevel: podcast.requiredLevel,
    };
  }
}
