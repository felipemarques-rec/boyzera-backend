import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { WalletConnection, WalletType } from '../../domain/entities/wallet-connection.entity';
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
export declare class TonConnectService {
    private configService;
    private walletConnectionRepository;
    private userRepository;
    private readonly logger;
    private readonly tonNetwork;
    constructor(configService: ConfigService, walletConnectionRepository: Repository<WalletConnection>, userRepository: Repository<User>);
    generatePayload(): Promise<string>;
    verifyProof(walletAddress: string, proof: TonConnectProof): Promise<boolean>;
    connectWallet(params: ConnectWalletParams): Promise<WalletConnection>;
    disconnectWallet(userId: string, walletAddress: string): Promise<void>;
    getUserWallets(userId: string): Promise<WalletConnection[]>;
    getPrimaryWallet(userId: string): Promise<WalletConnection | null>;
    getWalletByAddress(walletAddress: string): Promise<WalletConnection | null>;
    setPrimaryWallet(userId: string, walletAddress: string): Promise<void>;
    getExplorerUrl(address: string): string;
    getNetwork(): 'mainnet' | 'testnet';
}
