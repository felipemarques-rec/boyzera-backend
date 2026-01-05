import { EventEmitter2 } from '@nestjs/event-emitter';
import { TonConnectService, TonConnectProof, WalletInfo } from '../../infrastructure/blockchain/ton-connect.service';
import { WalletConnection, WalletType } from '../../domain/entities/wallet-connection.entity';
export interface ConnectWalletParams {
    userId: string;
    walletAddress: string;
    walletType: WalletType;
    proof: TonConnectProof;
    walletInfo?: WalletInfo;
}
export declare class ConnectWalletUseCase {
    private tonConnectService;
    private eventEmitter;
    constructor(tonConnectService: TonConnectService, eventEmitter: EventEmitter2);
    generatePayload(): Promise<{
        payload: string;
        expiresAt: number;
    }>;
    execute(params: ConnectWalletParams): Promise<WalletConnection>;
    disconnect(userId: string, walletAddress: string): Promise<void>;
    getUserWallets(userId: string): Promise<WalletConnection[]>;
    getPrimaryWallet(userId: string): Promise<WalletConnection | null>;
    setPrimaryWallet(userId: string, walletAddress: string): Promise<void>;
    getExplorerUrl(address: string): string;
    getNetwork(): 'mainnet' | 'testnet';
}
