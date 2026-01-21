import { DataSource } from 'typeorm';
import { Level } from '../../../domain/entities/level.entity';

export interface LevelSeedData {
  value: number;
  name: string;
  requiredFollowers: bigint;
  maxEnergy: number;
  energyRegenRate: number;
  tapMultiplier: number;
  rewardGems: number;
  rewardFollowers: bigint;
  description?: string;
}

export const levelsSeedData: LevelSeedData[] = [
  {
    value: 1,
    name: 'Zé Ninguém',
    requiredFollowers: BigInt(0),
    maxEnergy: 1000,
    energyRegenRate: 1,
    tapMultiplier: 1,
    rewardGems: 0,
    rewardFollowers: BigInt(0),
    description: 'Você está começando sua jornada!',
  },
  {
    value: 2,
    name: 'Microcelebridade do Bairro',
    requiredFollowers: BigInt(5000),
    maxEnergy: 1100,
    energyRegenRate: 1.1,
    tapMultiplier: 2,
    rewardGems: 10,
    rewardFollowers: BigInt(100),
    description: 'Seus primeiros seguidores aparecem!',
  },
  {
    value: 3,
    name: 'Trend do Instagram',
    requiredFollowers: BigInt(50000),
    maxEnergy: 1200,
    energyRegenRate: 1.2,
    tapMultiplier: 3,
    rewardGems: 25,
    rewardFollowers: BigInt(500),
    description: 'Você está virando trend!',
  },
  {
    value: 4,
    name: 'Dono do Hype',
    requiredFollowers: BigInt(250000),
    maxEnergy: 1350,
    energyRegenRate: 1.35,
    tapMultiplier: 4,
    rewardGems: 50,
    rewardFollowers: BigInt(1000),
    description: 'O hype é todo seu!',
  },
  {
    value: 5,
    name: 'Fenômeno da Internet',
    requiredFollowers: BigInt(1000000),
    maxEnergy: 1500,
    energyRegenRate: 1.5,
    tapMultiplier: 5,
    rewardGems: 100,
    rewardFollowers: BigInt(2500),
    description: 'Você atingiu 1 milhão de seguidores!',
  },
  {
    value: 6,
    name: 'Rei das Collabs',
    requiredFollowers: BigInt(3000000),
    maxEnergy: 1700,
    energyRegenRate: 1.7,
    tapMultiplier: 6,
    rewardGems: 150,
    rewardFollowers: BigInt(5000),
    description: 'Todo mundo quer fazer collab com você!',
  },
  {
    value: 7,
    name: 'Polêmico de Milhões',
    requiredFollowers: BigInt(7000000),
    maxEnergy: 1900,
    energyRegenRate: 1.9,
    tapMultiplier: 7,
    rewardGems: 200,
    rewardFollowers: BigInt(10000),
    description: 'Suas polêmicas viralizam!',
  },
  {
    value: 8,
    name: 'Dono do Brasil',
    requiredFollowers: BigInt(10000000),
    maxEnergy: 2100,
    energyRegenRate: 2.1,
    tapMultiplier: 8,
    rewardGems: 300,
    rewardFollowers: BigInt(15000),
    description: 'Você atingiu 10 milhões de seguidores!',
  },
  {
    value: 9,
    name: 'Mestre do Engajamento',
    requiredFollowers: BigInt(15000000),
    maxEnergy: 2350,
    energyRegenRate: 2.35,
    tapMultiplier: 9,
    rewardGems: 400,
    rewardFollowers: BigInt(25000),
    description: 'Seu engajamento é insano!',
  },
  {
    value: 10,
    name: 'O1 da Internet',
    requiredFollowers: BigInt(20000000),
    maxEnergy: 2600,
    energyRegenRate: 2.6,
    tapMultiplier: 10,
    rewardGems: 500,
    rewardFollowers: BigInt(50000),
    description: 'Você é o número 1 da internet!',
  },
  {
    value: 11,
    name: 'Visionário!',
    requiredFollowers: BigInt(30000000),
    maxEnergy: 3000,
    energyRegenRate: 3,
    tapMultiplier: 12,
    rewardGems: 1000,
    rewardFollowers: BigInt(100000),
    description: 'Você se tornou um visionário! Mais de 30 milhões de seguidores!',
  },
];

export async function seedLevels(dataSource: DataSource): Promise<void> {
  const levelRepository = dataSource.getRepository(Level);

  for (const levelData of levelsSeedData) {
    const existingLevel = await levelRepository.findOne({
      where: { value: levelData.value },
    });

    if (existingLevel) {
      await levelRepository.update(
        { value: levelData.value },
        {
          name: levelData.name,
          requiredFollowers: levelData.requiredFollowers,
          maxEnergy: levelData.maxEnergy,
          energyRegenRate: levelData.energyRegenRate,
          tapMultiplier: levelData.tapMultiplier,
          rewardGems: levelData.rewardGems,
          rewardFollowers: levelData.rewardFollowers,
          description: levelData.description,
        },
      );
      console.log(`Level ${levelData.value} (${levelData.name}) updated`);
    } else {
      const level = levelRepository.create({
        value: levelData.value,
        name: levelData.name,
        requiredFollowers: levelData.requiredFollowers,
        maxEnergy: levelData.maxEnergy,
        energyRegenRate: levelData.energyRegenRate,
        tapMultiplier: levelData.tapMultiplier,
        rewardGems: levelData.rewardGems,
        rewardFollowers: levelData.rewardFollowers,
        description: levelData.description,
      });
      await levelRepository.save(level);
      console.log(`Level ${levelData.value} (${levelData.name}) created`);
    }
  }

  console.log('Levels seed completed!');
}
