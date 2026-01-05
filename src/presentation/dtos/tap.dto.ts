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

export class TapResponseDto {
  success: boolean;
  tapsProcessed: number;
  followersEarned: string;
  totalFollowers: string;
  energy: number;
  maxEnergy: number;
  combo: number;
  comboMultiplier: number;
  levelUp?: {
    previousLevel: number;
    newLevel: number;
    rewards: {
      gems: number;
      followers: string;
    };
  };
}
