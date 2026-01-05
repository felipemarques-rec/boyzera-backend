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
import { Upgrade, UpgradeCategory, UpgradeEffectType } from '../../domain/entities/upgrade.entity';
import { AdminAuthGuard } from '../guards/admin-auth.guard';

interface CreateUpgradeDto {
  name: string;
  description: string;
  category: UpgradeCategory;
  effectType: UpgradeEffectType;
  baseCost: string;
  baseEffect: number;
  costMultiplier?: number;
  effectMultiplier?: number;
  requiredLevel?: number;
  maxLevel?: number;
  imageUrl?: string;
  iconName?: string;
  sortOrder?: number;
  isActive?: boolean;
}

interface UpdateUpgradeDto extends Partial<CreateUpgradeDto> {}

@Controller('admin/upgrades')
@UseGuards(AdminAuthGuard)
export class AdminUpgradesController {
  constructor(
    @InjectRepository(Upgrade)
    private upgradeRepository: Repository<Upgrade>,
  ) {}

  @Get()
  async getUpgrades(
    @Query('category') category?: UpgradeCategory,
    @Query('isActive') isActive?: string,
  ) {
    const queryBuilder = this.upgradeRepository.createQueryBuilder('upgrade');

    if (category) {
      queryBuilder.andWhere('upgrade.category = :category', { category });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('upgrade.isActive = :isActive', {
        isActive: isActive === 'true',
      });
    }

    queryBuilder.orderBy('upgrade.sortOrder', 'ASC');

    const upgrades = await queryBuilder.getMany();

    return {
      data: upgrades.map((u) => ({
        ...u,
        baseCost: u.baseCost.toString(),
      })),
      total: upgrades.length,
    };
  }

  @Get('stats')
  async getStats() {
    const total = await this.upgradeRepository.count();
    const active = await this.upgradeRepository.count({ where: { isActive: true } });

    const byCategory: Record<string, number> = {};
    for (const category of Object.values(UpgradeCategory)) {
      byCategory[category] = await this.upgradeRepository.count({ where: { category } });
    }

    return {
      total,
      active,
      inactive: total - active,
      byCategory,
    };
  }

  @Get(':id')
  async getUpgrade(@Param('id') id: string) {
    const upgrade = await this.upgradeRepository.findOne({ where: { id } });
    if (!upgrade) {
      return { error: 'Upgrade nao encontrado' };
    }
    return {
      ...upgrade,
      baseCost: upgrade.baseCost.toString(),
    };
  }

  @Post()
  async createUpgrade(@Body() dto: CreateUpgradeDto) {
    const upgrade = this.upgradeRepository.create({
      ...dto,
      baseCost: BigInt(dto.baseCost),
      costMultiplier: dto.costMultiplier ?? 1.15,
      effectMultiplier: dto.effectMultiplier ?? 1.1,
      requiredLevel: dto.requiredLevel ?? 1,
      maxLevel: dto.maxLevel ?? 100,
      sortOrder: dto.sortOrder ?? 0,
      isActive: dto.isActive ?? true,
    });

    await this.upgradeRepository.save(upgrade);

    return { success: true, message: 'Upgrade criado', data: { ...upgrade, baseCost: upgrade.baseCost.toString() } };
  }

  @Patch(':id')
  async updateUpgrade(@Param('id') id: string, @Body() dto: UpdateUpgradeDto) {
    const upgrade = await this.upgradeRepository.findOne({ where: { id } });
    if (!upgrade) {
      return { error: 'Upgrade nao encontrado' };
    }

    if (dto.baseCost !== undefined) {
      upgrade.baseCost = BigInt(dto.baseCost);
      delete dto.baseCost;
    }

    Object.assign(upgrade, dto);
    await this.upgradeRepository.save(upgrade);

    return { success: true, message: 'Upgrade atualizado' };
  }

  @Delete(':id')
  async deleteUpgrade(@Param('id') id: string) {
    const upgrade = await this.upgradeRepository.findOne({ where: { id } });
    if (!upgrade) {
      return { error: 'Upgrade nao encontrado' };
    }

    await this.upgradeRepository.remove(upgrade);

    return { success: true, message: 'Upgrade excluido' };
  }

  @Post(':id/toggle')
  async toggleUpgrade(@Param('id') id: string) {
    const upgrade = await this.upgradeRepository.findOne({ where: { id } });
    if (!upgrade) {
      return { error: 'Upgrade nao encontrado' };
    }

    upgrade.isActive = !upgrade.isActive;
    await this.upgradeRepository.save(upgrade);

    return { success: true, message: upgrade.isActive ? 'Upgrade ativado' : 'Upgrade desativado' };
  }
}
