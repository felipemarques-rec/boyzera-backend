import { Repository } from 'typeorm';
import { Season } from '../../domain/entities/season.entity';
export interface SeasonWithProgress {
    season: Season;
    daysRemaining: number;
    progressPercentage: number;
    isActive: boolean;
}
export declare class GetCurrentSeasonUseCase {
    private seasonRepository;
    constructor(seasonRepository: Repository<Season>);
    execute(): Promise<SeasonWithProgress | null>;
    getAllSeasons(): Promise<Season[]>;
    getSeasonById(seasonId: string): Promise<Season | null>;
    getSeasonHistory(): Promise<Season[]>;
}
