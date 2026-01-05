import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetReferralLinkUseCase } from '../../use-cases/referral/get-referral-link.use-case';
import { ProcessReferralUseCase } from '../../use-cases/referral/process-referral.use-case';
import { GetReferralStatsUseCase } from '../../use-cases/referral/get-referral-stats.use-case';

class ProcessReferralDto {
  referralCode: string;
}

@Controller('referral')
@UseGuards(AuthGuard('jwt'))
export class ReferralController {
  constructor(
    private getReferralLinkUseCase: GetReferralLinkUseCase,
    private processReferralUseCase: ProcessReferralUseCase,
    private getReferralStatsUseCase: GetReferralStatsUseCase,
  ) {}

  @Get('link')
  async getReferralLink(@Request() req) {
    return this.getReferralLinkUseCase.execute(req.user.id);
  }

  @Get('stats')
  async getReferralStats(@Request() req) {
    return this.getReferralStatsUseCase.execute(req.user.id);
  }

  @Get('leaderboard')
  async getReferralLeaderboard(@Query('limit') limit: number = 50) {
    return this.getReferralStatsUseCase.getReferralLeaderboard(limit);
  }

  @Post('process')
  async processReferral(@Request() req, @Body() dto: ProcessReferralDto) {
    return this.processReferralUseCase.execute(req.user.id, dto.referralCode);
  }
}
