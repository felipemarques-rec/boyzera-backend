import { Repository } from 'typeorm';
import { Squad, SquadMember } from '../entities/squad.entity';
import { User } from '../entities/user.entity';
export declare class SquadService {
    private squadRepository;
    private squadMemberRepository;
    private userRepository;
    constructor(squadRepository: Repository<Squad>, squadMemberRepository: Repository<SquadMember>, userRepository: Repository<User>);
    createSquad(userId: string, name: string, description?: string): Promise<Squad>;
    getSquadById(squadId: string): Promise<Squad | null>;
    getUserSquad(userId: string): Promise<Squad | null>;
    getSquadMembers(squadId: string): Promise<SquadMember[]>;
    joinSquad(userId: string, squadId: string): Promise<SquadMember>;
    leaveSquad(userId: string): Promise<void>;
    updateSquad(squadId: string, userId: string, data: Partial<Pick<Squad, 'name' | 'description' | 'imageUrl' | 'bannerUrl' | 'isOpen'>>): Promise<Squad>;
    searchSquads(query: string, limit?: number): Promise<Squad[]>;
    getTopSquads(limit?: number): Promise<Squad[]>;
    updateSquadStats(squadId: string): Promise<void>;
}
