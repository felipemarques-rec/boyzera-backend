export class HypeStatusDto {
  current: number;
  dailyEngagement: number;
  loginStreak: number;
  lastCalculation: string | null;
}

export class HypeCalculationResponseDto {
  success: boolean;
  previousHype: number;
  newHype: number;
  deltaHype: number;
  type: 'gain' | 'decay';
  decayReason?: string;
}
