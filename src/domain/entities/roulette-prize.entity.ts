import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum RoulettePrizeType {
  FOLLOWERS = 'FOLLOWERS',
  GEMS = 'GEMS',
  ENERGY = 'ENERGY',
  BOOSTER = 'BOOSTER',
  COSMETIC = 'COSMETIC',
  SPECIAL = 'SPECIAL',
}

@Entity('roulette_prizes')
export class RoulettePrize {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: RoulettePrizeType,
    default: RoulettePrizeType.FOLLOWERS,
  })
  type: RoulettePrizeType;

  @Column({ type: 'jsonb', nullable: true })
  reward: {
    followers?: number;
    gems?: number;
    energy?: number;
    boosterType?: string;
    boosterDuration?: number;
    boosterMultiplier?: number;
    cosmeticId?: string;
  };

  @Column({ type: 'float', default: 1 })
  probability: number; // Weight for random selection (higher = more likely)

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  color: string; // Color to display on roulette wheel

  @Column({ default: 0 })
  sortOrder: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isExclusive: boolean; // Only available via roulette

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
