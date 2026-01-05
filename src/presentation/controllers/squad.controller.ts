import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SquadService } from '../../domain/services/squad.service';

class CreateSquadDto {
  name: string;
  description?: string;
}

class UpdateSquadDto {
  name?: string;
  description?: string;
  imageUrl?: string;
  bannerUrl?: string;
  isOpen?: boolean;
}

@Controller('squad')
export class SquadController {
  constructor(private squadService: SquadService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createSquad(@Request() req, @Body() dto: CreateSquadDto) {
    const squad = await this.squadService.createSquad(
      req.user.id,
      dto.name,
      dto.description,
    );

    return {
      id: squad.id,
      name: squad.name,
      description: squad.description,
      level: squad.level,
      memberCount: squad.memberCount,
      maxMembers: squad.maxMembers,
      isOpen: squad.isOpen,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('my')
  async getMySquad(@Request() req) {
    const squad = await this.squadService.getUserSquad(req.user.id);

    if (!squad) {
      return { squad: null };
    }

    const members = await this.squadService.getSquadMembers(squad.id);

    return {
      squad: {
        id: squad.id,
        name: squad.name,
        description: squad.description,
        imageUrl: squad.imageUrl,
        bannerUrl: squad.bannerUrl,
        level: squad.level,
        totalFollowers: squad.totalFollowers.toString(),
        memberCount: squad.memberCount,
        maxMembers: squad.maxMembers,
        isOpen: squad.isOpen,
        isVerified: squad.isVerified,
        owner: {
          id: squad.owner.id,
          username: squad.owner.username,
          nickname: squad.owner.nickname,
          avatarUrl: squad.owner.avatarUrl,
        },
      },
      members: members.map((m) => ({
        id: m.id,
        role: m.role,
        joinedAt: m.joinedAt,
        contributedFollowers: m.contributedFollowers.toString(),
        user: {
          id: m.user.id,
          username: m.user.username,
          nickname: m.user.nickname,
          avatarUrl: m.user.avatarUrl,
          level: m.user.level,
          followers: m.user.followers.toString(),
        },
      })),
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async getSquad(@Param('id') id: string) {
    const squad = await this.squadService.getSquadById(id);

    if (!squad) {
      return { squad: null };
    }

    const members = await this.squadService.getSquadMembers(squad.id);

    return {
      squad: {
        id: squad.id,
        name: squad.name,
        description: squad.description,
        imageUrl: squad.imageUrl,
        bannerUrl: squad.bannerUrl,
        level: squad.level,
        totalFollowers: squad.totalFollowers.toString(),
        memberCount: squad.memberCount,
        maxMembers: squad.maxMembers,
        isOpen: squad.isOpen,
        isVerified: squad.isVerified,
        owner: {
          id: squad.owner.id,
          username: squad.owner.username,
          nickname: squad.owner.nickname,
          avatarUrl: squad.owner.avatarUrl,
        },
      },
      members: members.map((m) => ({
        id: m.id,
        role: m.role,
        joinedAt: m.joinedAt,
        contributedFollowers: m.contributedFollowers.toString(),
        user: {
          id: m.user.id,
          username: m.user.username,
          nickname: m.user.nickname,
          avatarUrl: m.user.avatarUrl,
          level: m.user.level,
          followers: m.user.followers.toString(),
        },
      })),
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id/members')
  async getSquadMembers(@Param('id') id: string) {
    const members = await this.squadService.getSquadMembers(id);

    return {
      members: members.map((m) => ({
        id: m.id,
        role: m.role,
        joinedAt: m.joinedAt,
        contributedFollowers: m.contributedFollowers.toString(),
        user: {
          id: m.user.id,
          username: m.user.username,
          nickname: m.user.nickname,
          avatarUrl: m.user.avatarUrl,
          level: m.user.level,
          followers: m.user.followers.toString(),
        },
      })),
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/join')
  async joinSquad(@Request() req, @Param('id') id: string) {
    const membership = await this.squadService.joinSquad(req.user.id, id);

    return {
      success: true,
      membership: {
        id: membership.id,
        role: membership.role,
        joinedAt: membership.joinedAt,
      },
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('leave')
  async leaveSquad(@Request() req) {
    await this.squadService.leaveSquad(req.user.id);

    return { success: true };
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  async updateSquad(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateSquadDto,
  ) {
    const squad = await this.squadService.updateSquad(id, req.user.id, dto);

    return {
      id: squad.id,
      name: squad.name,
      description: squad.description,
      imageUrl: squad.imageUrl,
      bannerUrl: squad.bannerUrl,
      isOpen: squad.isOpen,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async searchSquads(@Query('q') query: string, @Query('limit') limit?: number) {
    if (query) {
      const squads = await this.squadService.searchSquads(query, limit || 20);
      return {
        squads: squads.map((s) => ({
          id: s.id,
          name: s.name,
          description: s.description,
          imageUrl: s.imageUrl,
          level: s.level,
          memberCount: s.memberCount,
          maxMembers: s.maxMembers,
          totalFollowers: s.totalFollowers.toString(),
        })),
      };
    }

    const squads = await this.squadService.getTopSquads(limit || 10);
    return {
      squads: squads.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        imageUrl: s.imageUrl,
        level: s.level,
        memberCount: s.memberCount,
        maxMembers: s.maxMembers,
        totalFollowers: s.totalFollowers.toString(),
        owner: s.owner
          ? {
              id: s.owner.id,
              username: s.owner.username,
              nickname: s.owner.nickname,
            }
          : null,
      })),
    };
  }
}
