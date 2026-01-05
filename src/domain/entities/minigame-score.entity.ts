import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

export enum MinigameType {
  QUIZ = 'quiz', // Brazilian culture quiz
  MEMORY = 'memory', // Memory game
  SPEED_TAP = 'speed_tap', // Speed tap challenge
  WORD_SCRAMBLE = 'word_scramble', // Word scramble
  PATTERN_MATCH = 'pattern_match', // Pattern matching
}

export enum MinigameDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

export interface MinigameMetadata {
  correctAnswers?: number;
  totalQuestions?: number;
  timeSpent?: number; // in seconds
  perfectRounds?: number;
  hintsUsed?: number;
  streakBonus?: number;
}

@Entity('minigame_scores')
@Index(['userId', 'gameType'])
@Index(['gameType', 'score'])
export class MinigameScore {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: MinigameType,
  })
  @Index()
  gameType: MinigameType;

  @Column({
    type: 'enum',
    enum: MinigameDifficulty,
    default: MinigameDifficulty.MEDIUM,
  })
  difficulty: MinigameDifficulty;

  @Column({ type: 'int', default: 0 })
  score: number;

  @Column({ type: 'int', default: 0 })
  highScore: number;

  // Followers earned from this game
  @Column({
    type: 'decimal',
    precision: 30,
    scale: 0,
    default: '0',
    transformer: {
      to: (value: bigint | number) => value?.toString(),
      from: (value: string) => (value ? BigInt(value) : BigInt(0)),
    },
  })
  followersEarned: bigint;

  // Gems earned (if any)
  @Column({ type: 'int', default: 0 })
  gemsEarned: number;

  // Duration of the game in seconds
  @Column({ type: 'int', default: 0 })
  durationSeconds: number;

  // Additional game-specific data
  @Column({ type: 'jsonb', nullable: true })
  metadata: MinigameMetadata;

  @CreateDateColumn()
  @Index()
  createdAt: Date;

  // Helper methods
  isHighScore(): boolean {
    return this.score > this.highScore;
  }

  getScorePerSecond(): number {
    if (this.durationSeconds === 0) return 0;
    return this.score / this.durationSeconds;
  }
}
