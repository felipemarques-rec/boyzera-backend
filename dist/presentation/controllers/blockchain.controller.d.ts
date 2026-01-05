import { ConnectWalletUseCase } from '../../use-cases/blockchain/connect-wallet.use-case';
import { ClaimTokensUseCase } from '../../use-cases/blockchain/claim-tokens.use-case';
import { WalletType } from '../../domain/entities/wallet-connection.entity';
declare class ConnectWalletDto {
    walletAddress: string;
    walletType: WalletType;
    proof: {
        timestamp: number;
        domain: {
            lengthBytes: number;
            value: string;
        };
        signature: string;
        payload: string;
    };
    walletInfo?: {
        address: string;
        publicKey: string;
        walletVersion?: string;
        chainId?: number;
    };
}
declare class ExchangeGemsDto {
    gems: number;
}
export declare class BlockchainController {
    private connectWalletUseCase;
    private claimTokensUseCase;
    constructor(connectWalletUseCase: ConnectWalletUseCase, claimTokensUseCase: ClaimTokensUseCase);
    getConnectPayload(): Promise<{
        success: boolean;
        data: {
            payload: string;
            expiresAt: number;
        };
    }>;
    connectWallet(req: any, dto: ConnectWalletDto): Promise<{
        success: boolean;
        data: {
            id: string;
            walletAddress: string;
            shortAddress: string;
            walletType: WalletType;
            status: import("../../domain/entities/wallet-connection.entity").WalletStatus;
            isPrimary: boolean;
            connectedAt: Date;
            explorerUrl: string;
        };
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        data?: undefined;
    }>;
    disconnectWallet(req: any, address: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getUserWallets(req: any): Promise<{
        success: boolean;
        data: {
            id: string;
            walletAddress: string;
            shortAddress: string;
            walletType: WalletType;
            status: import("../../domain/entities/wallet-connection.entity").WalletStatus;
            isPrimary: boolean;
            connectedAt: Date;
            explorerUrl: string;
        }[];
    }>;
    setPrimaryWallet(req: any, address: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getTokenBalance(req: any): Promise<{
        success: boolean;
        data: {
            confirmed: number;
            pending: number;
            total: number;
        };
    }>;
    claimPendingTokens(req: any): Promise<{
        success: boolean;
        data: {
            claimed: number;
            failed: number;
            distributions: {
                id: string;
                type: import("../../domain/entities/token-distribution.entity").DistributionType;
                amount: number;
                status: import("../../domain/entities/token-distribution.entity").DistributionStatus;
                transactionHash: string | undefined;
                explorerUrl: string | null;
            }[];
        };
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        data?: undefined;
    }>;
    exchangeGemsForTokens(req: any, dto: ExchangeGemsDto): Promise<{
        success: boolean;
        data: {
            distributionId: string;
            gemsExchanged: number;
            tokensReceived: number;
            status: import("../../domain/entities/token-distribution.entity").DistributionStatus;
        };
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        data?: undefined;
    }>;
    getDistributionHistory(req: any, limit: number): Promise<{
        success: boolean;
        data: {
            id: string;
            type: import("../../domain/entities/token-distribution.entity").DistributionType;
            amount: number;
            status: import("../../domain/entities/token-distribution.entity").DistributionStatus;
            walletAddress: string | undefined;
            transactionHash: string | undefined;
            explorerUrl: string | null;
            metadata: import("../../domain/entities/token-distribution.entity").DistributionMetadata | undefined;
            createdAt: Date;
            processedAt: Date;
        }[];
    }>;
    getDistributionStats(req: any): Promise<{
        success: boolean;
        data: {
            totalDistributed: number;
            pendingAmount: number;
            completedCount: number;
            pendingCount: number;
        };
    }>;
    getBlockchainInfo(): Promise<{
        success: boolean;
        data: {
            enabled: boolean;
            network: "mainnet" | "testnet";
            tokenContract: string;
            supportedWallets: WalletType[];
        };
    }>;
}
export {};
