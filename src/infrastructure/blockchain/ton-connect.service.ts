import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  WalletConnection,
  WalletType,
  WalletStatus,
} from '../../domain/entities/wallet-connection.entity';
import { User } from '../../domain/entities/user.entity';

export interface TonConnectProof {
  timestamp: number;
  domain: {
    lengthBytes: number;
    value: string;
  };
  signature: string;
  payload: string;
}

export interface WalletInfo {
  address: string;
  publicKey: string;
  walletVersion?: string;
  chainId?: number;
}

export interface ConnectWalletParams {
  userId: string;
  walletAddress: string;
  walletType: WalletType;
  proof: TonConnectProof;
  walletInfo?: WalletInfo;
}

@Injectable()
export class TonConnectService {
  private readonly logger = new Logger(TonConnectService.name);
  private readonly tonNetwork: 'mainnet' | 'testnet';

  constructor(
    private configService: ConfigService,
    @InjectRepository(WalletConnection)
    private walletConnectionRepository: Repository<WalletConnection>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    this.tonNetwork = this.configService.get<string>(
      'TON_NETWORK',
      'testnet',
    ) as 'mainnet' | 'testnet';
  }

  async generatePayload(): Promise<string> {
    // Generate a unique payload for TON Connect proof
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return Buffer.from(`${timestamp}:${random}`).toString('base64');
  }

  async verifyProof(
    walletAddress: string,
    proof: TonConnectProof,
  ): Promise<boolean> {
    try {
      // In production, you would verify the TON Connect proof
      // This involves:
      // 1. Checking the timestamp is recent (within 5 minutes)
      // 2. Verifying the domain matches
      // 3. Verifying the signature using the wallet's public key

      const currentTime = Math.floor(Date.now() / 1000);
      const proofAge = currentTime - proof.timestamp;

      // Proof should be less than 5 minutes old
      if (proofAge > 300) {
        this.logger.warn(`Proof expired for wallet ${walletAddress}`);
        return false;
      }

      // TODO: Implement actual signature verification using @ton/crypto
      // For now, we accept the proof in development mode
      if (this.configService.get('NODE_ENV') === 'development') {
        return true;
      }

      // In production, verify the signature
      // const isValid = await this.verifySignature(walletAddress, proof);
      // return isValid;

      return true;
    } catch (error) {
      this.logger.error(`Proof verification failed: ${error}`);
      return false;
    }
  }

  async connectWallet(params: ConnectWalletParams): Promise<WalletConnection> {
    const { userId, walletAddress, walletType, proof, walletInfo } = params;

    // Verify the proof
    const isValid = await this.verifyProof(walletAddress, proof);
    if (!isValid) {
      throw new Error('Invalid wallet proof');
    }

    // Check if wallet is already connected to another user
    const existingConnection = await this.walletConnectionRepository.findOne({
      where: {
        walletAddress,
        status: WalletStatus.CONNECTED,
      },
    });

    if (existingConnection && existingConnection.userId !== userId) {
      throw new Error('Wallet is already connected to another account');
    }

    // Disconnect any existing connections for this user
    await this.walletConnectionRepository.update(
      { userId, status: WalletStatus.CONNECTED },
      { status: WalletStatus.DISCONNECTED, isPrimary: false },
    );

    // Create new connection
    const connection = this.walletConnectionRepository.create({
      userId,
      walletAddress,
      walletType,
      status: WalletStatus.CONNECTED,
      connectionProof: JSON.stringify(proof),
      metadata: {
        publicKey: walletInfo?.publicKey,
        walletVersion: walletInfo?.walletVersion,
        chainId: walletInfo?.chainId,
      },
      isPrimary: true,
      connectedAt: new Date(),
    });

    await this.walletConnectionRepository.save(connection);

    this.logger.log(`Wallet ${walletAddress} connected for user ${userId}`);

    return connection;
  }

  async disconnectWallet(userId: string, walletAddress: string): Promise<void> {
    await this.walletConnectionRepository.update(
      { userId, walletAddress, status: WalletStatus.CONNECTED },
      {
        status: WalletStatus.DISCONNECTED,
        disconnectedAt: new Date(),
        isPrimary: false,
      },
    );

    this.logger.log(`Wallet ${walletAddress} disconnected for user ${userId}`);
  }

  async getUserWallets(userId: string): Promise<WalletConnection[]> {
    return this.walletConnectionRepository.find({
      where: { userId, status: WalletStatus.CONNECTED },
      order: { isPrimary: 'DESC', connectedAt: 'DESC' },
    });
  }

  async getPrimaryWallet(userId: string): Promise<WalletConnection | null> {
    return this.walletConnectionRepository.findOne({
      where: { userId, status: WalletStatus.CONNECTED, isPrimary: true },
    });
  }

  async getWalletByAddress(
    walletAddress: string,
  ): Promise<WalletConnection | null> {
    return this.walletConnectionRepository.findOne({
      where: { walletAddress, status: WalletStatus.CONNECTED },
      relations: ['user'],
    });
  }

  async setPrimaryWallet(userId: string, walletAddress: string): Promise<void> {
    // Remove primary from all other wallets
    await this.walletConnectionRepository.update(
      { userId, status: WalletStatus.CONNECTED },
      { isPrimary: false },
    );

    // Set the specified wallet as primary
    await this.walletConnectionRepository.update(
      { userId, walletAddress, status: WalletStatus.CONNECTED },
      { isPrimary: true },
    );
  }

  getExplorerUrl(address: string): string {
    const baseUrl =
      this.tonNetwork === 'mainnet'
        ? 'https://tonscan.org/address/'
        : 'https://testnet.tonscan.org/address/';
    return `${baseUrl}${address}`;
  }

  getNetwork(): 'mainnet' | 'testnet' {
    return this.tonNetwork;
  }
}
