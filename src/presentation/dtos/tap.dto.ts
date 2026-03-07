import { IsInt, Min, Max, IsOptional, IsNumber } from 'class-validator';

export class BatchTapDto {
  @IsInt()
  @Min(1)
  @Max(100)
  taps: number;

  @IsOptional()
  @IsNumber()
  timestamp?: number;

  @IsOptional()
  clientHash?: string;
}

export class LevelProgressDto {
  currentLevel: number;
  progress: string;
  required: string;
  percentage: number;
}

export class TapResponseDto {
  success: boolean;
  tapsProcessed: number;
  followersEarned: string;
  totalFollowers: string;
  energy: number;
  maxEnergy: number;
  combo: number;
  comboMultiplier: number;
  levelProgress: LevelProgressDto;
  levelUp?: {
    previousLevel: number;
    newLevel: number;
    rewards: {
      gems: number;
      followers: string;
    };
  };
}
