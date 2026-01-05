import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Squad, SquadMember } from '../../domain/entities/squad.entity';
import { User } from '../../domain/entities/user.entity';
import { AdminAuthGuard } from '../guards/admin-auth.guard';

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

@Controller('admin/squads')
@UseGuards(AdminAuthGuard)
export class AdminSquadsController {
  constructor(
    @InjectRepository(Squad)
    private squadRepository: Repository<Squad>,
    @InjectRepository(SquadMember)
    private squadMemberRepository: Repository<SquadMember>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  @Get()
  async getSquads(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('search') search?: string,
    @Query('isOpen') isOpen?: string,
    @Query('isVerified') isVerified?: string,
    @Query('sortBy') sortBy: string = 'createdAt',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC',
  ) {
    const skip = (page - 1) * limit;

    const queryBuilder = this.squadRepository
      .createQueryBuilder('squad')
      .leftJoinAndSelect('squad.owner', 'owner');

    if (search) {
      queryBuilder.andWhere('squad.name ILIKE :search', { search: `%${search}%` });
    }

    if (isOpen !== undefined) {
      queryBuilder.andWhere('squad.isOpen = :isOpen', { isOpen: isOpen === 'true' });
    }

    if (isVerified !== undefined) {
      queryBuilder.andWhere('squad.isVerified = :isVerified', { isVerified: isVerified === 'true' });
    }

    const validSortFields = ['createdAt', 'memberCount', 'totalFollowers', 'level'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(`squad.${sortField}`, sortOrder);

    const [squads, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: squads.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        imageUrl: s.imageUrl,
        bannerUrl: s.bannerUrl,
        owner: s.owner
          ? {
              id: s.owner.id,
              username: s.owner.username,
              firstName: s.owner.firstName,
            }
          : null,
        level: s.level,
        totalFollowers: s.totalFollowers.toString(),
        memberCount: s.memberCount,
        maxMembers: s.maxMembers,
        isOpen: s.isOpen,
        isVerified: s.isVerified,
        createdAt: s.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  @Get('stats')
  async getStats() {
    const total = await this.squadRepository.count();
    const open = await this.squadRepository.count({ where: { isOpen: true } });
    const verified = await this.squadRepository.count({ where: { isVerified: true } });
    const totalMembers = await this.squadMemberRepository.count();

    // Average members per squad
    const avgMembers = total > 0 ? totalMembers / total : 0;

    // Top squads by followers
    const topSquads = await this.squadRepository
      .createQueryBuilder('squad')
      .orderBy('squad.totalFollowers', 'DESC')
      .limit(5)
      .getMany();

    return {
      total,
      open,
      closed: total - open,
      verified,
      totalMembers,
      avgMembersPerSquad: Math.round(avgMembers * 10) / 10,
      topSquads: topSquads.map((s) => ({
        id: s.id,
        name: s.name,
        totalFollowers: s.totalFollowers.toString(),
        memberCount: s.memberCount,
      })),
    };
  }

  @Get(':id')
  async getSquad(@Param('id') id: string) {
    const squad = await this.squadRepository.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (!squad) {
      return { error: 'Squad nao encontrado' };
    }

    // Get members
    const members = await this.squadMemberRepository.find({
      where: { squadId: id },
      relations: ['user'],
      order: { role: 'ASC', joinedAt: 'ASC' },
    });

    return {
      ...squad,
      totalFollowers: squad.totalFollowers.toString(),
      owner: squad.owner
        ? {
            id: squad.owner.id,
            username: squad.owner.username,
            firstName: squad.owner.firstName,
          }
        : null,
      members: members.map((m) => ({
        id: m.id,
        user: m.user
          ? {
              id: m.user.id,
              username: m.user.username,
              firstName: m.user.firstName,
            }
          : null,
        role: m.role,
        contributedFollowers: m.contributedFollowers.toString(),
        joinedAt: m.joinedAt,
      })),
    };
  }

  @Patch(':id')
  async updateSquad(@Param('id') id: string, @Body() dto: UpdateSquadDto) {
    const squad = await this.squadRepository.findOne({ where: { id } });
    if (!squad) {
      return { error: 'Squad nao encontrado' };
    }

    Object.assign(squad, dto);
    await this.squadRepository.save(squad);

    return { success: true, message: 'Squad atualizado' };
  }

  @Delete(':id')
  async deleteSquad(@Param('id') id: string) {
    const squad = await this.squadRepository.findOne({ where: { id } });
    if (!squad) {
      return { error: 'Squad nao encontrado' };
    }

    // Remove members first
    await this.squadMemberRepository.delete({ squadId: id });
    await this.squadRepository.remove(squad);

    return { success: true, message: 'Squad excluido' };
  }

  @Post(':id/verify')
  async verifySquad(@Param('id') id: string) {
    const squad = await this.squadRepository.findOne({ where: { id } });
    if (!squad) {
      return { error: 'Squad nao encontrado' };
    }

    squad.isVerified = true;
    await this.squadRepository.save(squad);

    return { success: true, message: 'Squad verificado' };
  }

  @Post(':id/unverify')
  async unverifySquad(@Param('id') id: string) {
    const squad = await this.squadRepository.findOne({ where: { id } });
    if (!squad) {
      return { error: 'Squad nao encontrado' };
    }

    squad.isVerified = false;
    await this.squadRepository.save(squad);

    return { success: true, message: 'Verificacao removida' };
  }

  @Delete(':id/members/:memberId')
  async removeMember(@Param('id') id: string, @Param('memberId') memberId: string) {
    const member = await this.squadMemberRepository.findOne({
      where: { id: memberId, squadId: id },
    });

    if (!member) {
      return { error: 'Membro nao encontrado' };
    }

    if (member.role === 'owner') {
      return { error: 'Nao e possivel remover o dono do squad' };
    }

    await this.squadMemberRepository.remove(member);

    // Update member count
    const squad = await this.squadRepository.findOne({ where: { id } });
    if (squad) {
      squad.memberCount = Math.max(0, squad.memberCount - 1);
      await this.squadRepository.save(squad);
    }

    return { success: true, message: 'Membro removido' };
  }
}
