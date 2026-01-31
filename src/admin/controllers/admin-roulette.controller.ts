import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminAuthGuard } from '../guards/admin-auth.guard';
import { RoulettePrize } from '../../domain/entities/roulette-prize.entity';
import { RouletteSpin } from '../../domain/entities/roulette-spin.entity';

@Controller('admin/roulette')
@UseGuards(AdminAuthGuard)
export class AdminRouletteController {
  constructor(
    @InjectRepository(RoulettePrize)
    private prizeRepository: Repository<RoulettePrize>,
    @InjectRepository(RouletteSpin)
    private spinRepository: Repository<RouletteSpin>,
  ) {}

  // Prizes CRUD
  @Get('prizes')
  async getPrizes() {
    return this.prizeRepository.find({
      order: { sortOrder: 'ASC' },
    });
  }

  @Get('prizes/:id')
  async getPrize(@Param('id') id: string) {
    return this.prizeRepository.findOne({ where: { id } });
  }

  @Post('prizes')
  async createPrize(@Body() data: Partial<RoulettePrize>) {
    const prize = this.prizeRepository.create(data);
    return this.prizeRepository.save(prize);
  }

  @Put('prizes/:id')
  async updatePrize(@Param('id') id: string, @Body() data: Partial<RoulettePrize>) {
    await this.prizeRepository.update(id, data);
    return this.prizeRepository.findOne({ where: { id } });
  }

  @Delete('prizes/:id')
  async deletePrize(@Param('id') id: string) {
    await this.prizeRepository.delete(id);
    return { success: true };
  }

  // Spin History
  @Get('spins')
  async getSpins() {
    return this.spinRepository.find({
      relations: ['user', 'prize'],
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  // Stats
  @Get('stats')
  async getStats() {
    const totalSpins = await this.spinRepository.count();
    const todaySpins = await this.spinRepository
      .createQueryBuilder('spin')
      .where('DATE(spin.createdAt) = CURRENT_DATE')
      .getCount();
    const activePrizes = await this.prizeRepository.count({ where: { isActive: true } });

    return {
      totalSpins,
      todaySpins,
      activePrizes,
    };
  }
}
