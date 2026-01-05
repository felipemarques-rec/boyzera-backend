import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppConfig } from '../entities/app-config.entity';
import { AdminAuthGuard } from '../guards/admin-auth.guard';

interface SetConfigDto {
  key: string;
  value: any;
  description?: string;
}

interface UpdateConfigDto {
  value: any;
  description?: string;
}

@Controller('admin/config')
@UseGuards(AdminAuthGuard)
export class AdminConfigController {
  constructor(
    @InjectRepository(AppConfig)
    private configRepository: Repository<AppConfig>,
  ) {}

  @Get()
  async getAllConfigs() {
    const configs = await this.configRepository.find({
      order: { key: 'ASC' },
    });

    return {
      data: configs,
      total: configs.length,
    };
  }

  @Get(':key')
  async getConfig(@Param('key') key: string) {
    const config = await this.configRepository.findOne({ where: { key } });
    if (!config) {
      return { error: 'Configuracao nao encontrada' };
    }
    return config;
  }

  @Post()
  async setConfig(@Body() dto: SetConfigDto) {
    let config = await this.configRepository.findOne({ where: { key: dto.key } });

    if (config) {
      config.value = dto.value;
      if (dto.description !== undefined) {
        config.description = dto.description;
      }
    } else {
      config = this.configRepository.create({
        key: dto.key,
        value: dto.value,
        description: dto.description,
      });
    }

    await this.configRepository.save(config);

    return { success: true, message: 'Configuracao salva', data: config };
  }

  @Patch(':key')
  async updateConfig(@Param('key') key: string, @Body() dto: UpdateConfigDto) {
    const config = await this.configRepository.findOne({ where: { key } });
    if (!config) {
      return { error: 'Configuracao nao encontrada' };
    }

    config.value = dto.value;
    if (dto.description !== undefined) {
      config.description = dto.description;
    }

    await this.configRepository.save(config);

    return { success: true, message: 'Configuracao atualizada' };
  }

  @Delete(':key')
  async deleteConfig(@Param('key') key: string) {
    const config = await this.configRepository.findOne({ where: { key } });
    if (!config) {
      return { error: 'Configuracao nao encontrada' };
    }

    await this.configRepository.remove(config);

    return { success: true, message: 'Configuracao excluida' };
  }

  // Bulk set configs
  @Post('bulk')
  async bulkSetConfigs(@Body() configs: SetConfigDto[]) {
    const results: AppConfig[] = [];

    for (const dto of configs) {
      let config = await this.configRepository.findOne({ where: { key: dto.key } });

      if (config) {
        config.value = dto.value;
        if (dto.description !== undefined) {
          config.description = dto.description;
        }
      } else {
        config = this.configRepository.create({
          key: dto.key,
          value: dto.value,
          description: dto.description,
        });
      }

      await this.configRepository.save(config);
      results.push(config);
    }

    return { success: true, message: `${results.length} configuracoes salvas`, data: results };
  }
}
