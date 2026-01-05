import { Injectable, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  TonConnectService,
  TonConnectProof,
  WalletInfo,
} from '../../infrastructure/blockchain/ton-connect.service';
import {
  WalletConnection,
  WalletType,
} from '../../domain/entities/wallet-connection.entity';

export interface ConnectWalletParams {
  userId: string;
  walletAddress: string;
  walletType: WalletType;
  proof: TonConnectProof;
  walletInfo?: WalletInfo;
}

@Injectable()
export class ConnectWalletUseCase {
  constructor(
    private tonConnectService: TonConnectService,
    private eventEmitter: EventEmitter2,
  ) {}

  async generatePayload(): Promise<{ payload: string; expiresAt: number }> {
    const payload = await this.tonConnectService.generatePayload();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    return { payload, expiresAt };
  }

  async execute(params: ConnectWalletParams): Promise<WalletConnection> {
    try {
      const connection = await this.tonConnectService.connectWallet(params);

      // Emit wallet connected event
      this.eventEmitter.emit('wallet.connected', {
        userId: params.userId,
        walletAddress: params.walletAddress,
        walletType: params.walletType,
      });

      return connection;
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to connect wallet',
      );
    }
  }

  async disconnect(userId: string, walletAddress: string): Promise<void> {
    await this.tonConnectService.disconnectWallet(userId, walletAddress);

    // Emit wallet disconnected event
    this.eventEmitter.emit('wallet.disconnected', {
      userId,
      walletAddress,
    });
  }

  async getUserWallets(userId: string): Promise<WalletConnection[]> {
    return this.tonConnectService.getUserWallets(userId);
  }

  async getPrimaryWallet(userId: string): Promise<WalletConnection | null> {
    return this.tonConnectService.getPrimaryWallet(userId);
  }

  async setPrimaryWallet(userId: string, walletAddress: string): Promise<void> {
    await this.tonConnectService.setPrimaryWallet(userId, walletAddress);
  }

  getExplorerUrl(address: string): string {
    return this.tonConnectService.getExplorerUrl(address);
  }

  getNetwork(): 'mainnet' | 'testnet' {
    return this.tonConnectService.getNetwork();
  }
}
