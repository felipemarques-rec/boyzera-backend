import { User } from './user.entity';
export declare class Squad {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    bannerUrl: string;
    ownerId: string;
    owner: User;
    level: number;
    totalFollowers: bigint;
    memberCount: number;
    maxMembers: number;
    isOpen: boolean;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare class SquadMember {
    id: string;
    squadId: string;
    squad: Squad;
    userId: string;
    user: User;
    role: 'owner' | 'admin' | 'member';
    contributedFollowers: bigint;
    joinedAt: Date;
}
