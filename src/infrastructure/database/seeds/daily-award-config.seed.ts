import { DataSource } from 'typeorm';
import { DailyAwardConfig } from '../../../domain/entities/daily-award-config.entity';

export interface DailyAwardConfigSeedData {
  version: string;
  alpha: number;
  beta: number;
  gamma: number;
  maxStreakBonus: number;
  minDailyGain: string;
  maxDailyGain: string;
  isActive: boolean;
}

export const dailyAwardConfigSeedData: DailyAwardConfigSeedData[] = [
  {
    version: 'econ_v1',
    alpha: 0.7,
    beta: 0.15,
    gamma: 1.4,
    maxStreakBonus: 0.5,
    minDailyGain: '1',
    maxDailyGain: '1000000',
    isActive: true,
  },
];

export async function seedDailyAwardConfig(
  dataSource: DataSource,
): Promise<void> {
  const repository = dataSource.getRepository(DailyAwardConfig);

  for (const data of dailyAwardConfigSeedData) {
    const existing = await repository.findOne({
      where: { version: data.version },
    });

    if (existing) {
      await repository.update(
        { version: data.version },
        {
          alpha: data.alpha,
          beta: data.beta,
          gamma: data.gamma,
          maxStreakBonus: data.maxStreakBonus,
          minDailyGain: data.minDailyGain,
          maxDailyGain: data.maxDailyGain,
          isActive: data.isActive,
        },
      );
      console.log(`DailyAwardConfig ${data.version} updated`);
    } else {
      const config = repository.create(data);
      await repository.save(config);
      console.log(`DailyAwardConfig ${data.version} created`);
    }
  }

  console.log('DailyAwardConfig seed completed!');
}
