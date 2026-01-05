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
import { Mission, MissionType, MissionRequirement, MissionReward } from '../../domain/entities/mission.entity';
import { AdminAuthGuard } from '../guards/admin-auth.guard';

interface CreateMissionDto {
  type: MissionType;
  title: string;
  description: string;
  requirement: MissionRequirement;
  reward: MissionReward;
  iconName?: string;
  imageUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
  requiredLevel?: number;
}

interface UpdateMissionDto extends Partial<CreateMissionDto> {}

@Controller('admin/missions')
@UseGuards(AdminAuthGuard)
export class AdminMissionsController {
  constructor(
    @InjectRepository(Mission)
    private missionRepository: Repository<Mission>,
  ) {}

  @Get()
  async getMissions(
    @Query('type') type?: MissionType,
    @Query('isActive') isActive?: string,
  ) {
    const queryBuilder = this.missionRepository.createQueryBuilder('mission');

    if (type) {
      queryBuilder.andWhere('mission.type = :type', { type });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('mission.isActive = :isActive', {
        isActive: isActive === 'true',
      });
    }

    queryBuilder.orderBy('mission.sortOrder', 'ASC');

    const missions = await queryBuilder.getMany();

    return {
      data: missions,
      total: missions.length,
    };
  }

  @Get('stats')
  async getStats() {
    const total = await this.missionRepository.count();
    const active = await this.missionRepository.count({ where: { isActive: true } });
    const daily = await this.missionRepository.count({ where: { type: MissionType.DAILY } });
    const weekly = await this.missionRepository.count({ where: { type: MissionType.WEEKLY } });
    const achievement = await this.missionRepository.count({ where: { type: MissionType.ACHIEVEMENT } });

    return {
      total,
      active,
      inactive: total - active,
      byType: {
        daily,
        weekly,
        achievement,
      },
    };
  }

  @Get(':id')
  async getMission(@Param('id') id: string) {
    const mission = await this.missionRepository.findOne({ where: { id } });
    if (!mission) {
      return { error: 'Missao nao encontrada' };
    }
    return mission;
  }

  @Post()
  async createMission(@Body() dto: CreateMissionDto) {
    const mission = this.missionRepository.create({
      ...dto,
      sortOrder: dto.sortOrder ?? 0,
      isActive: dto.isActive ?? true,
      requiredLevel: dto.requiredLevel ?? 1,
    });

    await this.missionRepository.save(mission);

    return { success: true, message: 'Missao criada', data: mission };
  }

  @Patch(':id')
  async updateMission(@Param('id') id: string, @Body() dto: UpdateMissionDto) {
    const mission = await this.missionRepository.findOne({ where: { id } });
    if (!mission) {
      return { error: 'Missao nao encontrada' };
    }

    Object.assign(mission, dto);
    await this.missionRepository.save(mission);

    return { success: true, message: 'Missao atualizada' };
  }

  @Delete(':id')
  async deleteMission(@Param('id') id: string) {
    const mission = await this.missionRepository.findOne({ where: { id } });
    if (!mission) {
      return { error: 'Missao nao encontrada' };
    }

    await this.missionRepository.remove(mission);

    return { success: true, message: 'Missao excluida' };
  }

  @Post(':id/toggle')
  async toggleMission(@Param('id') id: string) {
    const mission = await this.missionRepository.findOne({ where: { id } });
    if (!mission) {
      return { error: 'Missao nao encontrada' };
    }

    mission.isActive = !mission.isActive;
    await this.missionRepository.save(mission);

    return { success: true, message: mission.isActive ? 'Missao ativada' : 'Missao desativada' };
  }
}
