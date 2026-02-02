import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SocialService } from '../../infrastructure/social/social.service';

@Controller('social')
@UseGuards(AuthGuard('jwt'))
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  // ==================== COLLABORATIONS ====================

  @Get('collaborations')
  async getCollaborations(@Request() req) {
    return this.socialService.getCollaborations(req.user.id);
  }

  @Post('collaborations/:id/participate')
  async participateInCollaboration(
    @Request() req,
    @Param('id') collaborationId: string,
  ) {
    return this.socialService.participateInCollaboration(
      req.user.id,
      collaborationId,
    );
  }

  @Post('collaborations/:id/complete')
  async completeCollaboration(
    @Request() req,
    @Param('id') collaborationId: string,
  ) {
    return this.socialService.completeCollaboration(
      req.user.id,
      collaborationId,
    );
  }

  // ==================== INTERVIEWS ====================

  @Get('interviews')
  async getInterviews(@Request() req) {
    return this.socialService.getInterviews(req.user.id);
  }

  @Post('interviews/:id/participate')
  async participateInInterview(
    @Request() req,
    @Param('id') interviewId: string,
  ) {
    return this.socialService.participateInInterview(req.user.id, interviewId);
  }

  // ==================== PODCASTS ====================

  @Get('podcasts')
  async getPodcasts(@Request() req) {
    return this.socialService.getPodcasts(req.user.id);
  }

  @Post('podcasts/:id/participate')
  async participateInPodcast(
    @Request() req,
    @Param('id') podcastId: string,
  ) {
    return this.socialService.participateInPodcast(req.user.id, podcastId);
  }
}
