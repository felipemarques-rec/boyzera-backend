import { Repository } from 'typeorm';
import { Collaboration } from '../../domain/entities/collaboration.entity';
import { Interview } from '../../domain/entities/interview.entity';
import { Podcast } from '../../domain/entities/podcast.entity';
export declare class AdminSocialController {
    private collaborationRepository;
    private interviewRepository;
    private podcastRepository;
    constructor(collaborationRepository: Repository<Collaboration>, interviewRepository: Repository<Interview>, podcastRepository: Repository<Podcast>);
    getCollaborations(): Promise<Collaboration[]>;
    getCollaboration(id: string): Promise<Collaboration | null>;
    createCollaboration(data: Partial<Collaboration>): Promise<Collaboration>;
    updateCollaboration(id: string, data: Partial<Collaboration>): Promise<Collaboration | null>;
    deleteCollaboration(id: string): Promise<{
        success: boolean;
    }>;
    getInterviews(): Promise<Interview[]>;
    getInterview(id: string): Promise<Interview | null>;
    createInterview(data: Partial<Interview>): Promise<Interview>;
    updateInterview(id: string, data: Partial<Interview>): Promise<Interview | null>;
    deleteInterview(id: string): Promise<{
        success: boolean;
    }>;
    getPodcasts(): Promise<Podcast[]>;
    getPodcast(id: string): Promise<Podcast | null>;
    createPodcast(data: Partial<Podcast>): Promise<Podcast>;
    updatePodcast(id: string, data: Partial<Podcast>): Promise<Podcast | null>;
    deletePodcast(id: string): Promise<{
        success: boolean;
    }>;
    getStats(): Promise<{
        collaborations: number;
        interviews: number;
        podcasts: number;
        total: number;
    }>;
}
