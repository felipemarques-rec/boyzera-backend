import { SquadService } from '../../domain/services/squad.service';
declare class CreateSquadDto {
    name: string;
    description?: string;
}
declare class UpdateSquadDto {
    name?: string;
    description?: string;
    imageUrl?: string;
    bannerUrl?: string;
    isOpen?: boolean;
}
export declare class SquadController {
    private squadService;
    constructor(squadService: SquadService);
    createSquad(req: any, dto: CreateSquadDto): Promise<{
        id: string;
        name: string;
        description: string;
        level: number;
        memberCount: number;
        maxMembers: number;
        isOpen: boolean;
    }>;
    getMySquad(req: any): Promise<{
        squad: null;
        members?: undefined;
    } | {
        squad: {
            id: string;
            name: string;
            description: string;
            imageUrl: string;
            bannerUrl: string;
            level: number;
            totalFollowers: string;
            memberCount: number;
            maxMembers: number;
            isOpen: boolean;
            isVerified: boolean;
            owner: {
                id: string;
                username: string;
                nickname: string;
                avatarUrl: string;
            };
        };
        members: {
            id: string;
            role: "owner" | "admin" | "member";
            joinedAt: Date;
            contributedFollowers: string;
            user: {
                id: string;
                username: string;
                nickname: string;
                avatarUrl: string;
                level: number;
                followers: string;
            };
        }[];
    }>;
    getSquad(id: string): Promise<{
        squad: null;
        members?: undefined;
    } | {
        squad: {
            id: string;
            name: string;
            description: string;
            imageUrl: string;
            bannerUrl: string;
            level: number;
            totalFollowers: string;
            memberCount: number;
            maxMembers: number;
            isOpen: boolean;
            isVerified: boolean;
            owner: {
                id: string;
                username: string;
                nickname: string;
                avatarUrl: string;
            };
        };
        members: {
            id: string;
            role: "owner" | "admin" | "member";
            joinedAt: Date;
            contributedFollowers: string;
            user: {
                id: string;
                username: string;
                nickname: string;
                avatarUrl: string;
                level: number;
                followers: string;
            };
        }[];
    }>;
    getSquadMembers(id: string): Promise<{
        members: {
            id: string;
            role: "owner" | "admin" | "member";
            joinedAt: Date;
            contributedFollowers: string;
            user: {
                id: string;
                username: string;
                nickname: string;
                avatarUrl: string;
                level: number;
                followers: string;
            };
        }[];
    }>;
    joinSquad(req: any, id: string): Promise<{
        success: boolean;
        membership: {
            id: string;
            role: "owner" | "admin" | "member";
            joinedAt: Date;
        };
    }>;
    leaveSquad(req: any): Promise<{
        success: boolean;
    }>;
    updateSquad(req: any, id: string, dto: UpdateSquadDto): Promise<{
        id: string;
        name: string;
        description: string;
        imageUrl: string;
        bannerUrl: string;
        isOpen: boolean;
    }>;
    searchSquads(query: string, limit?: number): Promise<{
        squads: {
            id: string;
            name: string;
            description: string;
            imageUrl: string;
            level: number;
            memberCount: number;
            maxMembers: number;
            totalFollowers: string;
        }[];
    }>;
}
export {};
