import { DataSource } from 'typeorm';
import { HypeConfig } from '../../../domain/entities/hype-config.entity';

export interface HypeConfigSeedData {
  version: string;
  beta: number;
  gamma: number;
  maxStreakBonus: number;
  minDailyGain: number;
  decayLight: number;
  decayNormal: number;
  decayHeavy: number;
  minEngagementThreshold: number;
  isActive: boolean;
}

export const hypeConfigSeedData: HypeConfigSeedData[] = [
  {
    version: 'econ_v1_hype',
    beta: 0.15,
    gamma: 1.2,
    maxStreakBonus: 0.20,
    minDailyGain: 0.005,
    decayLight: 0.03,
    decayNormal: 0.05,
    decayHeavy: 0.07,
    minEngagementThreshold: 0.3,
    isActive: true,
  },
];

export async function seedHypeConfig(dataSource: DataSource): Promise<void> {
  const repository = dataSource.getRepository(HypeConfig);

  for (const data of hypeConfigSeedData) {
    const existing = await repository.findOne({
      where: { version: data.version },
    });

    if (existing) {
      await repository.update(
        { version: data.version },
        {
          beta: data.beta,
          gamma: data.gamma,
          maxStreakBonus: data.maxStreakBonus,
          minDailyGain: data.minDailyGain,
          decayLight: data.decayLight,
          decayNormal: data.decayNormal,
          decayHeavy: data.decayHeavy,
          minEngagementThreshold: data.minEngagementThreshold,
          isActive: data.isActive,
        },
      );
      console.log(`HypeConfig ${data.version} updated`);
    } else {
      const config = repository.create(data);
      await repository.save(config);
      console.log(`HypeConfig ${data.version} created`);
    }
  }

  console.log('HypeConfig seed completed!');
}
