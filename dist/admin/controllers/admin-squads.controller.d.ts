import { Repository } from 'typeorm';
import { Squad, SquadMember } from '../../domain/entities/squad.entity';
import { User } from '../../domain/entities/user.entity';
interface UpdateSquadDto {
    name?: string;
    description?: string;
    imageUrl?: string;
    bannerUrl?: string;
    level?: number;
    maxMembers?: number;
    isOpen?: boolean;
    isVerified?: boolean;
}
export declare class AdminSquadsController {
    private squadRepository;
    private squadMemberRepository;
    private userRepository;
    constructor(squadRepository: Repository<Squad>, squadMemberRepository: Repository<SquadMember>, userRepository: Repository<User>);
    getSquads(page?: number, limit?: number, search?: string, isOpen?: string, isVerified?: string, sortBy?: string, sortOrder?: 'ASC' | 'DESC'): Promise<{
        data: {
            id: string;
            name: string;
            description: string;
            imageUrl: string;
            bannerUrl: string;
            owner: {
                id: string;
                username: string;
                firstName: string;
            } | null;
            level: number;
            totalFollowers: string;
            memberCount: number;
            maxMembers: number;
            isOpen: boolean;
            isVerified: boolean;
            createdAt: Date;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getStats(): Promise<{
        total: number;
        open: number;
        closed: number;
        verified: number;
        totalMembers: number;
        avgMembersPerSquad: number;
        topSquads: {
            id: string;
            name: string;
            totalFollowers: string;
            memberCount: number;
        }[];
    }>;
    getSquad(id: string): Promise<{
        error: string;
    } | {
        totalFollowers: string;
        owner: {
            id: string;
            username: string;
            firstName: string;
        } | null;
        members: {
            id: string;
            user: {
                id: string;
                username: string;
                firstName: string;
            } | null;
            role: "owner" | "admin" | "member";
            contributedFollowers: string;
            joinedAt: Date;
        }[];
        id: string;
        name: string;
        description: string;
        imageUrl: string;
        bannerUrl: string;
        ownerId: string;
        level: number;
        memberCount: number;
        maxMembers: number;
        isOpen: boolean;
        isVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
        error?: undefined;
    }>;
    updateSquad(id: string, dto: UpdateSquadDto): Promise<{
        error: string;
        success?: undefined;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        error?: undefined;
    }>;
    deleteSquad(id: string): Promise<{
        error: string;
        success?: undefined;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        error?: undefined;
    }>;
    verifySquad(id: string): Promise<{
        error: string;
        success?: undefined;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        error?: undefined;
    }>;
    unverifySquad(id: string): Promise<{
        error: string;
        success?: undefined;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        error?: undefined;
    }>;
    removeMember(id: string, memberId: string): Promise<{
        error: string;
        success?: undefined;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        error?: undefined;
    }>;
}
export {};
