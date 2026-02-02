import { SocialService } from '../../infrastructure/social/social.service';
export declare class SocialController {
    private readonly socialService;
    constructor(socialService: SocialService);
    getCollaborations(req: any): Promise<{
        userStatus: import("../../domain/entities/user-collaboration.entity").UserCollaborationStatus | null;
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
    participateInCollaboration(req: any, collaborationId: string): Promise<{
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
    completeCollaboration(req: any, collaborationId: string): Promise<{
        success: boolean;
        message: string;
        rewards: {
            followers?: number;
            gems?: number;
        };
    }>;
    getInterviews(req: any): Promise<{
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
    participateInInterview(req: any, interviewId: string): Promise<{
        success: boolean;
        message: string;
        rewards: {
            followers?: number;
            gems?: number;
        };
        engagementChange: number;
    }>;
    getPodcasts(req: any): Promise<{
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
    participateInPodcast(req: any, podcastId: string): Promise<{
        success: boolean;
        message: string;
        rewards: {
            followers?: number;
            gems?: number;
        };
        engagementChange: number;
    }>;
}
