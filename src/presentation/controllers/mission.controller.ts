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
import { GetMissionsUseCase } from '../../use-cases/mission/get-missions.use-case';
import { ClaimMissionRewardUseCase } from '../../use-cases/mission/claim-mission-reward.use-case';
import { MissionType } from '../../domain/entities/mission.entity';

@Controller('missions')
@UseGuards(AuthGuard('jwt'))
export class MissionController {
  constructor(
    private getMissionsUseCase: GetMissionsUseCase,
    private claimMissionRewardUseCase: ClaimMissionRewardUseCase,
  ) {}

  @Get()
  async getMissions(@Request() req, @Query('type') type?: MissionType) {
    return this.getMissionsUseCase.execute(req.user.id, type);
  }

  @Get('daily')
  async getDailyMissions(@Request() req) {
    return this.getMissionsUseCase.getDailyMissions(req.user.id);
  }

  @Get('weekly')
  async getWeeklyMissions(@Request() req) {
    return this.getMissionsUseCase.getWeeklyMissions(req.user.id);
  }

  @Get('achievements')
  async getAchievements(@Request() req) {
    return this.getMissionsUseCase.getAchievements(req.user.id);
  }

  @Post(':id/claim')
  async claimReward(@Request() req, @Param('id') missionId: string) {
    return this.claimMissionRewardUseCase.execute(req.user.id, missionId);
  }

  @Post('claim-all')
  async claimAllRewards(@Request() req) {
    return this.claimMissionRewardUseCase.claimAllCompleted(req.user.id);
  }
}
