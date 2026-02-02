import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum CharacterArea {
  SOCIAL = 'SOCIAL',
  GARAGE = 'GARAGE',
  CLOSET = 'CLOSET',
  HOUSE = 'HOUSE',
  GAME = 'GAME',
  SHOP = 'SHOP',
  SQUAD = 'SQUAD',
  MISSIONS = 'MISSIONS',
  CHALLENGES = 'CHALLENGES',
  MINIGAMES = 'MINIGAMES',
  ROULETTE = 'ROULETTE',
  RAFFLES = 'RAFFLES',
  ACHIEVEMENTS = 'ACHIEVEMENTS',
  SEASONS = 'SEASONS',
  SYSTEM = 'SYSTEM',
}

export enum CharacterMood {
  HAPPY = 'HAPPY',
  NEUTRAL = 'NEUTRAL',
  EXCITED = 'EXCITED',
  SAD = 'SAD',
  ANGRY = 'ANGRY',
  SURPRISED = 'SURPRISED',
}

@Entity('characters')
export class Character {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  displayName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ nullable: true })
  fullImageUrl: string;

  @Column({
    type: 'enum',
    enum: CharacterArea,
  })
  area: CharacterArea;

  @Column({
    type: 'enum',
    enum: CharacterMood,
    default: CharacterMood.NEUTRAL,
  })
  defaultMood: CharacterMood;

  @Column({ nullable: true })
  catchphrase: string;

  @Column({ type: 'jsonb', nullable: true })
  greetings: string[];

  @Column({ type: 'jsonb', nullable: true })
  customColors: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
