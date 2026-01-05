import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Season, SeasonStatus } from '../../domain/entities/season.entity';

export interface SeasonWithProgress {
  season: Season;
  daysRemaining: number;
  progressPercentage: number;
  isActive: boolean;
}

@Injectable()
export class GetCurrentSeasonUseCase {
  constructor(
    @InjectRepository(Season)
    private seasonRepository: Repository<Season>,
  ) {}

  async execute(): Promise<SeasonWithProgress | null> {
    const now = new Date();

    // First, try to find an active season
    let season = await this.seasonRepository.findOne({
      where: {
        status: SeasonStatus.ACTIVE,
        startDate: LessThanOrEqual(now),
        endDate: MoreThanOrEqual(now),
      },
      order: { startDate: 'DESC' },
    });

    // If no active season, check if there's an upcoming one
    if (!season) {
      season = await this.seasonRepository.findOne({
        where: {
          status: SeasonStatus.UPCOMING,
          startDate: MoreThanOrEqual(now),
        },
        order: { startDate: 'ASC' },
      });
    }

    if (!season) {
      return null;
    }

    return {
      season,
      daysRemaining: season.getDaysRemaining(),
      progressPercentage: season.getProgressPercentage(),
      isActive: season.isActive(),
    };
  }

  async getAllSeasons(): Promise<Season[]> {
    return this.seasonRepository.find({
      order: { seasonNumber: 'DESC' },
    });
  }

  async getSeasonById(seasonId: string): Promise<Season | null> {
    return this.seasonRepository.findOne({
      where: { id: seasonId },
    });
  }

  async getSeasonHistory(): Promise<Season[]> {
    return this.seasonRepository.find({
      where: { status: SeasonStatus.ENDED },
      order: { endDate: 'DESC' },
    });
  }
}
