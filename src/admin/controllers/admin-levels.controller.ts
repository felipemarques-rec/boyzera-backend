import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Level } from '../../domain/entities/level.entity';
import { AdminAuthGuard, AdminRoles } from '../guards/admin-auth.guard';
import { AdminRole } from '../entities/admin-user.entity';

interface CreateLevelDto {
  value: number;
  name: string;
  requiredFollowers: string;
  maxEnergy: number;
  energyRegenRate: number;
  tapMultiplier: number;
  rewardGems?: number;
  rewardFollowers?: string;
  skinUnlock?: string;
  description?: string;
}

interface UpdateLevelDto {
  name?: string;
  requiredFollowers?: string;
  maxEnergy?: number;
  energyRegenRate?: number;
  tapMultiplier?: number;
  rewardGems?: number;
  rewardFollowers?: string;
  skinUnlock?: string;
  description?: string;
}

@Controller('admin/levels')
@UseGuards(AdminAuthGuard)
export class AdminLevelsController {
  constructor(
    @InjectRepository(Level)
    private levelRepository: Repository<Level>,
  ) {}

  @Get()
  async getLevels() {
    const levels = await this.levelRepository.find({
      order: { value: 'ASC' },
    });

    return {
      data: levels.map((level) => ({
        value: level.value,
        name: level.name,
        requiredFollowers: level.requiredFollowers.toString(),
        maxEnergy: level.maxEnergy,
        energyRegenRate: level.energyRegenRate,
        tapMultiplier: level.tapMultiplier,
        rewardGems: level.rewardGems,
        rewardFollowers: level.rewardFollowers.toString(),
        skinUnlock: level.skinUnlock,
        description: level.description,
      })),
      total: levels.length,
    };
  }

  @Get(':value')
  async getLevel(@Param('value', ParseIntPipe) value: number) {
    const level = await this.levelRepository.findOne({ where: { value } });
    if (!level) {
      return { error: 'Nível não encontrado' };
    }

    return {
      value: level.value,
      name: level.name,
      requiredFollowers: level.requiredFollowers.toString(),
      maxEnergy: level.maxEnergy,
      energyRegenRate: level.energyRegenRate,
      tapMultiplier: level.tapMultiplier,
      rewardGems: level.rewardGems,
      rewardFollowers: level.rewardFollowers.toString(),
      skinUnlock: level.skinUnlock,
      description: level.description,
    };
  }

  @Post()
  @AdminRoles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  async createLevel(@Body() dto: CreateLevelDto) {
    // Check if level value already exists
    const existing = await this.levelRepository.findOne({
      where: { value: dto.value },
    });
    if (existing) {
      return { error: 'Nível com este valor já existe' };
    }

    const level = this.levelRepository.create({
      value: dto.value,
      name: dto.name,
      requiredFollowers: BigInt(dto.requiredFollowers || '0'),
      maxEnergy: dto.maxEnergy,
      energyRegenRate: dto.energyRegenRate,
      tapMultiplier: dto.tapMultiplier,
      rewardGems: dto.rewardGems || 0,
      rewardFollowers: BigInt(dto.rewardFollowers || '0'),
      skinUnlock: dto.skinUnlock,
      description: dto.description,
    });

    await this.levelRepository.save(level);

    return { success: true, message: 'Nível criado', value: level.value };
  }

  @Patch(':value')
  @AdminRoles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  async updateLevel(
    @Param('value', ParseIntPipe) value: number,
    @Body() dto: UpdateLevelDto,
  ) {
    const level = await this.levelRepository.findOne({ where: { value } });
    if (!level) {
      return { error: 'Nível não encontrado' };
    }

    if (dto.name !== undefined) {
      level.name = dto.name;
    }
    if (dto.requiredFollowers !== undefined) {
      level.requiredFollowers = BigInt(dto.requiredFollowers);
    }
    if (dto.maxEnergy !== undefined) {
      level.maxEnergy = dto.maxEnergy;
    }
    if (dto.energyRegenRate !== undefined) {
      level.energyRegenRate = dto.energyRegenRate;
    }
    if (dto.tapMultiplier !== undefined) {
      level.tapMultiplier = dto.tapMultiplier;
    }
    if (dto.rewardGems !== undefined) {
      level.rewardGems = dto.rewardGems;
    }
    if (dto.rewardFollowers !== undefined) {
      level.rewardFollowers = BigInt(dto.rewardFollowers);
    }
    if (dto.skinUnlock !== undefined) {
      level.skinUnlock = dto.skinUnlock;
    }
    if (dto.description !== undefined) {
      level.description = dto.description;
    }

    await this.levelRepository.save(level);

    return { success: true, message: 'Nível atualizado' };
  }

  @Delete(':value')
  @AdminRoles(AdminRole.SUPER_ADMIN)
  async deleteLevel(@Param('value', ParseIntPipe) value: number) {
    const level = await this.levelRepository.findOne({ where: { value } });
    if (!level) {
      return { error: 'Nível não encontrado' };
    }

    await this.levelRepository.remove(level);

    return { success: true, message: 'Nível deletado' };
  }
}
