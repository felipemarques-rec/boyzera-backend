import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RaffleService } from '../../infrastructure/raffle/raffle.service';

@Controller('raffles')
@UseGuards(AuthGuard('jwt'))
export class RaffleController {
  constructor(private readonly raffleService: RaffleService) {}

  @Get()
  async getActiveRaffles(@Request() req) {
    return this.raffleService.getActiveRaffles(req.user.id);
  }

  @Get('my-tickets')
  async getMyTickets(@Request() req, @Query('raffleId') raffleId?: string) {
    return this.raffleService.getUserTickets(req.user.id, raffleId);
  }

  @Get('winners')
  async getWinners(@Query('raffleId') raffleId?: string) {
    return this.raffleService.getWinners(raffleId);
  }

  @Get(':id')
  async getRaffleDetails(@Request() req, @Param('id') raffleId: string) {
    return this.raffleService.getRaffleDetails(req.user.id, raffleId);
  }

  @Post(':raffleId/tasks/:taskId/start')
  async startTask(
    @Request() req,
    @Param('raffleId') raffleId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.raffleService.startTaskVerification(req.user.id, raffleId, taskId);
  }

  @Post(':raffleId/tasks/:taskId/verify')
  async verifyTask(
    @Request() req,
    @Param('raffleId') raffleId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.raffleService.verifyTask(req.user.id, raffleId, taskId);
  }

  @Post(':raffleId/tasks/:taskId/claim')
  async claimTickets(
    @Request() req,
    @Param('raffleId') raffleId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.raffleService.claimTickets(req.user.id, raffleId, taskId);
  }
}
