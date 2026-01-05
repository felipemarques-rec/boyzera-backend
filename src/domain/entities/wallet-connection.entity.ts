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

export enum WalletType {
  TON = 'ton',
  TONKEEPER = 'tonkeeper',
  MYTONWALLET = 'mytonwallet',
  OPENMASK = 'openmask',
  TONHUB = 'tonhub',
}

export enum WalletStatus {
  PENDING = 'pending', // Connection initiated
  CONNECTED = 'connected', // Wallet connected
  DISCONNECTED = 'disconnected', // User disconnected
  EXPIRED = 'expired', // Connection expired
}

export interface WalletMetadata {
  walletVersion?: string;
  publicKey?: string;
  chainId?: number;
  lastBalance?: string;
  lastBalanceUpdate?: Date;
}

@Entity('wallet_connections')
@Index(['userId', 'status'])
@Index(['walletAddress', 'status'])
export class WalletConnection {
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
    enum: WalletType,
    default: WalletType.TON,
  })
  walletType: WalletType;

  @Column({ type: 'varchar', length: 128 })
  @Index({ unique: true })
  walletAddress: string;

  @Column({
    type: 'enum',
    enum: WalletStatus,
    default: WalletStatus.PENDING,
  })
  @Index()
  status: WalletStatus;

  @Column({ type: 'varchar', nullable: true })
  connectionProof: string; // TON Connect proof

  @Column({ type: 'jsonb', nullable: true })
  metadata: WalletMetadata;

  @Column({ type: 'boolean', default: true })
  isPrimary: boolean;

  @Column({ type: 'timestamp', nullable: true })
  connectedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  disconnectedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods
  isConnected(): boolean {
    return this.status === WalletStatus.CONNECTED;
  }

  getShortAddress(): string {
    if (!this.walletAddress) return '';
    return `${this.walletAddress.slice(0, 6)}...${this.walletAddress.slice(-4)}`;
  }
}
