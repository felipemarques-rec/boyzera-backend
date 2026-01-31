import { Controller, Get, Post, UseGuards, Request, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RouletteService } from '../../infrastructure/roulette/roulette.service';

@Controller('roulette')
@UseGuards(AuthGuard('jwt'))
export class RouletteController {
  constructor(private readonly rouletteService: RouletteService) {}

  @Get('status')
  async getStatus(@Request() req) {
    return this.rouletteService.getStatus(req.user.id);
  }

  @Get('prizes')
  async getPrizes() {
    return this.rouletteService.getPrizes();
  }

  @Post('spin')
  async spin(@Request() req) {
    return this.rouletteService.spin(req.user.id);
  }

  @Get('history')
  async getHistory(@Request() req, @Query('limit') limit?: number) {
    return this.rouletteService.getHistory(req.user.id, limit || 10);
  }
}
