"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../../domain/entities/user.entity");
const collaboration_entity_1 = require("../../domain/entities/collaboration.entity");
const user_collaboration_entity_1 = require("../../domain/entities/user-collaboration.entity");
const interview_entity_1 = require("../../domain/entities/interview.entity");
const user_interview_entity_1 = require("../../domain/entities/user-interview.entity");
const podcast_entity_1 = require("../../domain/entities/podcast.entity");
const user_podcast_entity_1 = require("../../domain/entities/user-podcast.entity");
let SocialService = class SocialService {
    userRepository;
    collaborationRepository;
    userCollaborationRepository;
    interviewRepository;
    userInterviewRepository;
    podcastRepository;
    userPodcastRepository;
    constructor(userRepository, collaborationRepository, userCollaborationRepository, interviewRepository, userInterviewRepository, podcastRepository, userPodcastRepository) {
        this.userRepository = userRepository;
        this.collaborationRepository = collaborationRepository;
        this.userCollaborationRepository = userCollaborationRepository;
        this.interviewRepository = interviewRepository;
        this.userInterviewRepository = userInterviewRepository;
        this.podcastRepository = podcastRepository;
        this.userPodcastRepository = userPodcastRepository;
    }
    async getCollaborations(userId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const now = new Date();
        const collaborations = await this.collaborationRepository.find({
            where: {
                isActive: true,
                requiredLevel: (0, typeorm_2.LessThanOrEqual)(user.level),
            },
            order: { sortOrder: 'ASC' },
        });
        const userCollabs = await this.userCollaborationRepository.find({
            where: { userId },
        });
        const userCollabMap = new Map(userCollabs.map((uc) => [uc.collaborationId, uc]));
        return collaborations.map((collab) => {
            const userCollab = userCollabMap.get(collab.id);
            return {
                ...this.formatCollaboration(collab),
                userStatus: userCollab?.status || null,
                canParticipate: !userCollab && (collab.maxParticipants === 0 || collab.currentParticipants < collab.maxParticipants),
            };
        });
    }
    async participateInCollaboration(userId, collaborationId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const collaboration = await this.collaborationRepository.findOne({
            where: { id: collaborationId },
        });
        if (!collaboration)
            throw new common_1.NotFoundException('Collaboration not found');
        if (!collaboration.isActive) {
            throw new common_1.BadRequestException('This collaboration is no longer active');
        }
        if (user.level < collaboration.requiredLevel) {
            throw new common_1.BadRequestException(`You need to be level ${collaboration.requiredLevel} to participate`);
        }
        const existing = await this.userCollaborationRepository.findOne({
            where: { userId, collaborationId },
        });
        if (existing) {
            throw new common_1.BadRequestException('You are already participating in this collaboration');
        }
        if (collaboration.maxParticipants > 0 && collaboration.currentParticipants >= collaboration.maxParticipants) {
            throw new common_1.BadRequestException('This collaboration is full');
        }
        const userCollab = this.userCollaborationRepository.create({
            userId,
            collaborationId,
            status: user_collaboration_entity_1.UserCollaborationStatus.IN_PROGRESS,
        });
        await this.userCollaborationRepository.save(userCollab);
        collaboration.currentParticipants += 1;
        await this.collaborationRepository.save(collaboration);
        return {
            success: true,
            message: 'Successfully joined collaboration',
            collaboration: this.formatCollaboration(collaboration),
        };
    }
    async completeCollaboration(userId, collaborationId) {
        const userCollab = await this.userCollaborationRepository.findOne({
            where: { userId, collaborationId },
            relations: ['collaboration'],
        });
        if (!userCollab) {
            throw new common_1.NotFoundException('Participation not found');
        }
        if (userCollab.status === user_collaboration_entity_1.UserCollaborationStatus.COMPLETED) {
            throw new common_1.BadRequestException('Collaboration already completed');
        }
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const collaboration = userCollab.collaboration;
        const rewards = {};
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
        userCollab.status = user_collaboration_entity_1.UserCollaborationStatus.COMPLETED;
        userCollab.completedAt = new Date();
        userCollab.rewardsClaimed = rewards;
        await this.userCollaborationRepository.save(userCollab);
        return {
            success: true,
            message: 'Collaboration completed!',
            rewards,
        };
    }
    async getInterviews(userId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const now = new Date();
        const interviews = await this.interviewRepository.find({
            where: {
                isActive: true,
                requiredLevel: (0, typeorm_2.LessThanOrEqual)(user.level),
            },
            order: { sortOrder: 'ASC' },
        });
        const userInterviews = await this.userInterviewRepository.find({
            where: { userId },
        });
        const userInterviewMap = new Map(userInterviews.map((ui) => [ui.interviewId, ui]));
        return interviews.map((interview) => {
            const userInterview = userInterviewMap.get(interview.id);
            return {
                ...this.formatInterview(interview),
                isCompleted: userInterview?.isCompleted || false,
                canParticipate: !userInterview,
            };
        });
    }
    async participateInInterview(userId, interviewId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const interview = await this.interviewRepository.findOne({
            where: { id: interviewId },
        });
        if (!interview)
            throw new common_1.NotFoundException('Interview not found');
        if (!interview.isActive) {
            throw new common_1.BadRequestException('This interview is no longer available');
        }
        if (user.level < interview.requiredLevel) {
            throw new common_1.BadRequestException(`You need to be level ${interview.requiredLevel} to participate`);
        }
        const existing = await this.userInterviewRepository.findOne({
            where: { userId, interviewId },
        });
        if (existing) {
            throw new common_1.BadRequestException('You have already participated in this interview');
        }
        const rewards = {};
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
    async getPodcasts(userId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const podcasts = await this.podcastRepository.find({
            where: {
                isActive: true,
                requiredLevel: (0, typeorm_2.LessThanOrEqual)(user.level),
            },
            order: { sortOrder: 'ASC' },
        });
        const userPodcasts = await this.userPodcastRepository.find({
            where: { userId },
        });
        const userPodcastMap = new Map(userPodcasts.map((up) => [up.podcastId, up]));
        return podcasts.map((podcast) => {
            const userPodcast = userPodcastMap.get(podcast.id);
            return {
                ...this.formatPodcast(podcast),
                isCompleted: userPodcast?.isCompleted || false,
                canParticipate: !userPodcast,
            };
        });
    }
    async participateInPodcast(userId, podcastId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const podcast = await this.podcastRepository.findOne({
            where: { id: podcastId },
        });
        if (!podcast)
            throw new common_1.NotFoundException('Podcast not found');
        if (!podcast.isActive) {
            throw new common_1.BadRequestException('This podcast is no longer available');
        }
        if (user.level < podcast.requiredLevel) {
            throw new common_1.BadRequestException(`You need to be level ${podcast.requiredLevel} to participate`);
        }
        const existing = await this.userPodcastRepository.findOne({
            where: { userId, podcastId },
        });
        if (existing) {
            throw new common_1.BadRequestException('You have already participated in this podcast');
        }
        const rewards = {};
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
    formatCollaboration(collab) {
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
    formatInterview(interview) {
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
    formatPodcast(podcast) {
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
};
exports.SocialService = SocialService;
exports.SocialService = SocialService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(collaboration_entity_1.Collaboration)),
    __param(2, (0, typeorm_1.InjectRepository)(user_collaboration_entity_1.UserCollaboration)),
    __param(3, (0, typeorm_1.InjectRepository)(interview_entity_1.Interview)),
    __param(4, (0, typeorm_1.InjectRepository)(user_interview_entity_1.UserInterview)),
    __param(5, (0, typeorm_1.InjectRepository)(podcast_entity_1.Podcast)),
    __param(6, (0, typeorm_1.InjectRepository)(user_podcast_entity_1.UserPodcast)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SocialService);
//# sourceMappingURL=social.service.js.map