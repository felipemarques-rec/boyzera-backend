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
import { Collaboration } from '../../domain/entities/collaboration.entity';
import { Interview } from '../../domain/entities/interview.entity';
import { Podcast } from '../../domain/entities/podcast.entity';

@Controller('admin/social')
@UseGuards(AdminAuthGuard)
export class AdminSocialController {
  constructor(
    @InjectRepository(Collaboration)
    private collaborationRepository: Repository<Collaboration>,
    @InjectRepository(Interview)
    private interviewRepository: Repository<Interview>,
    @InjectRepository(Podcast)
    private podcastRepository: Repository<Podcast>,
  ) {}

  // === COLLABORATIONS ===
  @Get('collaborations')
  async getCollaborations() {
    return this.collaborationRepository.find({
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  @Get('collaborations/:id')
  async getCollaboration(@Param('id') id: string) {
    return this.collaborationRepository.findOne({ where: { id } });
  }

  @Post('collaborations')
  async createCollaboration(@Body() data: Partial<Collaboration>) {
    const collab = this.collaborationRepository.create(data);
    return this.collaborationRepository.save(collab);
  }

  @Put('collaborations/:id')
  async updateCollaboration(@Param('id') id: string, @Body() data: Partial<Collaboration>) {
    await this.collaborationRepository.update(id, data);
    return this.collaborationRepository.findOne({ where: { id } });
  }

  @Delete('collaborations/:id')
  async deleteCollaboration(@Param('id') id: string) {
    await this.collaborationRepository.delete(id);
    return { success: true };
  }

  // === INTERVIEWS ===
  @Get('interviews')
  async getInterviews() {
    return this.interviewRepository.find({
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  @Get('interviews/:id')
  async getInterview(@Param('id') id: string) {
    return this.interviewRepository.findOne({ where: { id } });
  }

  @Post('interviews')
  async createInterview(@Body() data: Partial<Interview>) {
    const interview = this.interviewRepository.create(data);
    return this.interviewRepository.save(interview);
  }

  @Put('interviews/:id')
  async updateInterview(@Param('id') id: string, @Body() data: Partial<Interview>) {
    await this.interviewRepository.update(id, data);
    return this.interviewRepository.findOne({ where: { id } });
  }

  @Delete('interviews/:id')
  async deleteInterview(@Param('id') id: string) {
    await this.interviewRepository.delete(id);
    return { success: true };
  }

  // === PODCASTS ===
  @Get('podcasts')
  async getPodcasts() {
    return this.podcastRepository.find({
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  @Get('podcasts/:id')
  async getPodcast(@Param('id') id: string) {
    return this.podcastRepository.findOne({ where: { id } });
  }

  @Post('podcasts')
  async createPodcast(@Body() data: Partial<Podcast>) {
    const podcast = this.podcastRepository.create(data);
    return this.podcastRepository.save(podcast);
  }

  @Put('podcasts/:id')
  async updatePodcast(@Param('id') id: string, @Body() data: Partial<Podcast>) {
    await this.podcastRepository.update(id, data);
    return this.podcastRepository.findOne({ where: { id } });
  }

  @Delete('podcasts/:id')
  async deletePodcast(@Param('id') id: string) {
    await this.podcastRepository.delete(id);
    return { success: true };
  }

  // Stats
  @Get('stats')
  async getStats() {
    const collaborations = await this.collaborationRepository.count({ where: { isActive: true } });
    const interviews = await this.interviewRepository.count({ where: { isActive: true } });
    const podcasts = await this.podcastRepository.count({ where: { isActive: true } });

    return {
      collaborations,
      interviews,
      podcasts,
      total: collaborations + interviews + podcasts,
    };
  }
}
