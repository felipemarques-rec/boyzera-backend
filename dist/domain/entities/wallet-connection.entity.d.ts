import { User } from './user.entity';
export declare enum WalletType {
    TON = "ton",
    TONKEEPER = "tonkeeper",
    MYTONWALLET = "mytonwallet",
    OPENMASK = "openmask",
    TONHUB = "tonhub"
}
export declare enum WalletStatus {
    PENDING = "pending",
    CONNECTED = "connected",
    DISCONNECTED = "disconnected",
    EXPIRED = "expired"
}
export interface WalletMetadata {
    walletVersion?: string;
    publicKey?: string;
    chainId?: number;
    lastBalance?: string;
    lastBalanceUpdate?: Date;
}
export declare class WalletConnection {
    id: string;
    userId: string;
    user: User;
    walletType: WalletType;
    walletAddress: string;
    status: WalletStatus;
    connectionProof: string;
    metadata: WalletMetadata;
    isPrimary: boolean;
    connectedAt: Date;
    disconnectedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    isConnected(): boolean;
    getShortAddress(): string;
}
