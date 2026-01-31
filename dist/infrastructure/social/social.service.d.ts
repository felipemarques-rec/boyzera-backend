import { Repository } from 'typeorm';
import { User } from '../../domain/entities/user.entity';
import { Collaboration } from '../../domain/entities/collaboration.entity';
import { UserCollaboration, UserCollaborationStatus } from '../../domain/entities/user-collaboration.entity';
import { Interview } from '../../domain/entities/interview.entity';
import { UserInterview } from '../../domain/entities/user-interview.entity';
import { Podcast } from '../../domain/entities/podcast.entity';
import { UserPodcast } from '../../domain/entities/user-podcast.entity';
export declare class SocialService {
    private userRepository;
    private collaborationRepository;
    private userCollaborationRepository;
    private interviewRepository;
    private userInterviewRepository;
    private podcastRepository;
    private userPodcastRepository;
    constructor(userRepository: Repository<User>, collaborationRepository: Repository<Collaboration>, userCollaborationRepository: Repository<UserCollaboration>, interviewRepository: Repository<Interview>, userInterviewRepository: Repository<UserInterview>, podcastRepository: Repository<Podcast>, userPodcastRepository: Repository<UserPodcast>);
    getCollaborations(userId: string): Promise<{
        userStatus: UserCollaborationStatus | null;
        canParticipate: boolean;
        id: string;
        title: string;
        description: string;
        type: import("../../domain/entities/collaboration.entity").CollaborationType;
        brandName: string;
        brandLogo: string;
        imageUrl: string;
        followersReward: string;
        gemsReward: number;
        engagementBonus: number;
        requiredLevel: number;
        durationMinutes: number;
        expiresAt: Date;
        maxParticipants: number;
        currentParticipants: number;
    }[]>;
    participateInCollaboration(userId: string, collaborationId: string): Promise<{
        success: boolean;
        message: string;
        collaboration: {
            id: string;
            title: string;
            description: string;
            type: import("../../domain/entities/collaboration.entity").CollaborationType;
            brandName: string;
            brandLogo: string;
            imageUrl: string;
            followersReward: string;
            gemsReward: number;
            engagementBonus: number;
            requiredLevel: number;
            durationMinutes: number;
            expiresAt: Date;
            maxParticipants: number;
            currentParticipants: number;
        };
    }>;
    completeCollaboration(userId: string, collaborationId: string): Promise<{
        success: boolean;
        message: string;
        rewards: {
            followers?: number;
            gems?: number;
        };
    }>;
    getInterviews(userId: string): Promise<{
        isCompleted: boolean;
        canParticipate: boolean;
        id: string;
        title: string;
        description: string;
        type: import("../../domain/entities/interview.entity").InterviewType;
        hostName: string;
        hostAvatar: string;
        channelName: string;
        imageUrl: string;
        followersReward: string;
        gemsReward: number;
        engagementChange: number;
        requiredLevel: number;
    }[]>;
    participateInInterview(userId: string, interviewId: string): Promise<{
        success: boolean;
        message: string;
        rewards: {
            followers?: number;
            gems?: number;
        };
        engagementChange: number;
    }>;
    getPodcasts(userId: string): Promise<{
        isCompleted: boolean;
        canParticipate: boolean;
        id: string;
        title: string;
        description: string;
        category: import("../../domain/entities/podcast.entity").PodcastCategory;
        hostName: string;
        hostAvatar: string;
        podcastName: string;
        imageUrl: string;
        audioUrl: string;
        durationMinutes: number;
        followersReward: string;
        gemsReward: number;
        engagementChange: number;
        requiredLevel: number;
    }[]>;
    participateInPodcast(userId: string, podcastId: string): Promise<{
        success: boolean;
        message: string;
        rewards: {
            followers?: number;
            gems?: number;
        };
        engagementChange: number;
    }>;
    private formatCollaboration;
    private formatInterview;
    private formatPodcast;
}
