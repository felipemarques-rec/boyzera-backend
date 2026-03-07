import { Entity, Column, PrimaryColumn } from 'typeorm';
import { bigintTransformer } from '../../shared/utils/bigint.transformer';

@Entity('levels')
export class Level {
  @PrimaryColumn()
  value: number;

  @Column()
  name: string;

  @Column({
    type: 'bigint',
    transformer: bigintTransformer,
  })
  requiredFollowers: bigint;

  @Column({ default: 1000 })
  maxEnergy: number;

  @Column({ type: 'float', default: 1 })
  energyRegenRate: number;

  @Column({ default: 1 })
  tapMultiplier: number;

  @Column({ default: 0 })
  rewardGems: number;

  @Column({
    type: 'bigint',
    default: 0,
    transformer: bigintTransformer,
  })
  rewardFollowers: bigint;

  @Column({ type: 'float', default: 0.01 })
  engagementLossRate: number;

  @Column({ nullable: true })
  skinUnlock: string;

  @Column({ nullable: true })
  description: string;
}
