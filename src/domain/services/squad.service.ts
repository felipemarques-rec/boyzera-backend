import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Squad, SquadMember } from '../entities/squad.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class SquadService {
  constructor(
    @InjectRepository(Squad)
    private squadRepository: Repository<Squad>,
    @InjectRepository(SquadMember)
    private squadMemberRepository: Repository<SquadMember>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createSquad(
    userId: string,
    name: string,
    description?: string,
  ): Promise<Squad> {
    // Check if user already owns a squad
    const existingSquad = await this.squadRepository.findOne({
      where: { ownerId: userId },
    });

    if (existingSquad) {
      throw new BadRequestException('User already owns a squad');
    }

    // Create squad
    const squad = this.squadRepository.create({
      name,
      description,
      ownerId: userId,
      memberCount: 1,
    });

    await this.squadRepository.save(squad);

    // Add owner as member
    const member = this.squadMemberRepository.create({
      squadId: squad.id,
      userId,
      role: 'owner',
    });

    await this.squadMemberRepository.save(member);

    return squad;
  }

  async getSquadById(squadId: string): Promise<Squad | null> {
    return this.squadRepository.findOne({
      where: { id: squadId },
      relations: ['owner'],
    });
  }

  async getUserSquad(userId: string): Promise<Squad | null> {
    const membership = await this.squadMemberRepository.findOne({
      where: { userId },
      relations: ['squad', 'squad.owner'],
    });

    return membership?.squad || null;
  }

  async getSquadMembers(squadId: string): Promise<SquadMember[]> {
    return this.squadMemberRepository.find({
      where: { squadId },
      relations: ['user'],
      order: { joinedAt: 'ASC' },
    });
  }

  async joinSquad(userId: string, squadId: string): Promise<SquadMember> {
    // Check if user is already in a squad
    const existingMembership = await this.squadMemberRepository.findOne({
      where: { userId },
    });

    if (existingMembership) {
      throw new BadRequestException('User is already in a squad');
    }

    // Get squad
    const squad = await this.squadRepository.findOne({
      where: { id: squadId },
    });

    if (!squad) {
      throw new NotFoundException('Squad not found');
    }

    if (!squad.isOpen) {
      throw new BadRequestException('Squad is not accepting new members');
    }

    if (squad.memberCount >= squad.maxMembers) {
      throw new BadRequestException('Squad is full');
    }

    // Create membership
    const member = this.squadMemberRepository.create({
      squadId,
      userId,
      role: 'member',
    });

    await this.squadMemberRepository.save(member);

    // Update member count
    squad.memberCount += 1;
    await this.squadRepository.save(squad);

    return member;
  }

  async leaveSquad(userId: string): Promise<void> {
    const membership = await this.squadMemberRepository.findOne({
      where: { userId },
      relations: ['squad'],
    });

    if (!membership) {
      throw new BadRequestException('User is not in a squad');
    }

    if (membership.role === 'owner') {
      throw new BadRequestException(
        'Owner cannot leave squad. Transfer ownership or delete squad.',
      );
    }

    await this.squadMemberRepository.remove(membership);

    // Update member count
    const squad = membership.squad;
    squad.memberCount -= 1;
    await this.squadRepository.save(squad);
  }

  async updateSquad(
    squadId: string,
    userId: string,
    data: Partial<Pick<Squad, 'name' | 'description' | 'imageUrl' | 'bannerUrl' | 'isOpen'>>,
  ): Promise<Squad> {
    const squad = await this.squadRepository.findOne({
      where: { id: squadId },
    });

    if (!squad) {
      throw new NotFoundException('Squad not found');
    }

    // Check if user is owner or admin
    const membership = await this.squadMemberRepository.findOne({
      where: { squadId, userId },
    });

    if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
      throw new BadRequestException('Not authorized to update squad');
    }

    Object.assign(squad, data);
    return this.squadRepository.save(squad);
  }

  async searchSquads(query: string, limit = 20): Promise<Squad[]> {
    return this.squadRepository
      .createQueryBuilder('squad')
      .where('squad.name ILIKE :query', { query: `%${query}%` })
      .andWhere('squad.isOpen = true')
      .orderBy('squad.memberCount', 'DESC')
      .limit(limit)
      .getMany();
  }

  async getTopSquads(limit = 10): Promise<Squad[]> {
    return this.squadRepository.find({
      order: { totalFollowers: 'DESC' },
      take: limit,
      relations: ['owner'],
    });
  }

  async updateSquadStats(squadId: string): Promise<void> {
    const members = await this.squadMemberRepository.find({
      where: { squadId },
      relations: ['user'],
    });

    let totalFollowers = BigInt(0);
    for (const member of members) {
      totalFollowers += member.user.followers;
    }

    await this.squadRepository.update(squadId, {
      totalFollowers,
      memberCount: members.length,
    });
  }
}
