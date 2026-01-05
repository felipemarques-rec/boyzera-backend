import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

export enum ChallengeType {
  X1_TAP = 'x1_tap', // Tap duel - who taps more in X seconds
  TRUCO = 'truco', // Card game
  SPEED_TAP = 'speed_tap', // Speed tap challenge
  MEMORY = 'memory', // Memory game
  QUIZ = 'quiz', // Quiz challenge
}

export enum ChallengeStatus {
  PENDING = 'pending', // Waiting for opponent to accept
  ACCEPTED = 'accepted', // Opponent accepted, waiting to start
  ONGOING = 'ongoing', // Challenge in progress
  COMPLETED = 'completed', // Challenge finished
  CANCELLED = 'cancelled', // Challenge was cancelled
  EXPIRED = 'expired', // Challenge expired without acceptance
}

export interface ChallengeConfig {
  duration?: number; // Duration in seconds for timed challenges
  rounds?: number; // Number of rounds
  maxTaps?: number; // Max taps allowed
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface ChallengeResult {
  challengerId: string;
  challengerScore: number;
  opponentId: string;
  opponentScore: number;
  winnerId: string | null; // null for tie
  completedAt: Date;
}

@Entity('challenges')
@Index(['challengerId', 'status'])
@Index(['opponentId', 'status'])
export class Challenge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ChallengeType,
  })
  @Index()
  type: ChallengeType;

  @Column({
    type: 'enum',
    enum: ChallengeStatus,
    default: ChallengeStatus.PENDING,
  })
  @Index()
  status: ChallengeStatus;

  // Challenger (initiator)
  @Column({ type: 'uuid' })
  @Index()
  challengerId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'challengerId' })
  challenger: User;

  // Opponent
  @Column({ type: 'uuid' })
  @Index()
  opponentId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'opponentId' })
  opponent: User;

  // Bet amount (followers)
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
  betAmount: bigint;

  // Challenge configuration
  @Column({ type: 'jsonb', nullable: true })
  config: ChallengeConfig;

  // Challenge result
  @Column({ type: 'jsonb', nullable: true })
  result: ChallengeResult;

  // Winner gets this
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
  prizePool: bigint;

  // Expiration time for pending challenges
  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  // When the challenge started
  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  // When the challenge ended
  @Column({ type: 'timestamp', nullable: true })
  endedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods
  isPending(): boolean {
    return this.status === ChallengeStatus.PENDING;
  }

  isOngoing(): boolean {
    return this.status === ChallengeStatus.ONGOING;
  }

  isCompleted(): boolean {
    return this.status === ChallengeStatus.COMPLETED;
  }

  canAccept(): boolean {
    if (this.status !== ChallengeStatus.PENDING) return false;
    if (this.expiresAt && new Date() > this.expiresAt) return false;
    return true;
  }

  getWinnerId(): string | null {
    if (!this.result) return null;
    return this.result.winnerId;
  }

  isParticipant(userId: string): boolean {
    return this.challengerId === userId || this.opponentId === userId;
  }

  getOpponentFor(userId: string): string | null {
    if (userId === this.challengerId) return this.opponentId;
    if (userId === this.opponentId) return this.challengerId;
    return null;
  }
}
