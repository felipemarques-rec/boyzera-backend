"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockchainController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const connect_wallet_use_case_1 = require("../../use-cases/blockchain/connect-wallet.use-case");
const claim_tokens_use_case_1 = require("../../use-cases/blockchain/claim-tokens.use-case");
const wallet_connection_entity_1 = require("../../domain/entities/wallet-connection.entity");
class ConnectWalletDto {
    walletAddress;
    walletType;
    proof;
    walletInfo;
}
class ExchangeGemsDto {
    gems;
}
let BlockchainController = class BlockchainController {
    connectWalletUseCase;
    claimTokensUseCase;
    constructor(connectWalletUseCase, claimTokensUseCase) {
        this.connectWalletUseCase = connectWalletUseCase;
        this.claimTokensUseCase = claimTokensUseCase;
    }
    async getConnectPayload() {
        const result = await this.connectWalletUseCase.generatePayload();
        return {
            success: true,
            data: result,
        };
    }
    async connectWallet(req, dto) {
        try {
            const connection = await this.connectWalletUseCase.execute({
                userId: req.user.id,
                walletAddress: dto.walletAddress,
                walletType: dto.walletType,
                proof: dto.proof,
                walletInfo: dto.walletInfo,
            });
            return {
                success: true,
                data: {
                    id: connection.id,
                    walletAddress: connection.walletAddress,
                    shortAddress: connection.getShortAddress(),
                    walletType: connection.walletType,
                    status: connection.status,
                    isPrimary: connection.isPrimary,
                    connectedAt: connection.connectedAt,
                    explorerUrl: this.connectWalletUseCase.getExplorerUrl(connection.walletAddress),
                },
            };
        }
        catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to connect wallet',
            };
        }
    }
    async disconnectWallet(req, address) {
        await this.connectWalletUseCase.disconnect(req.user.id, address);
        return {
            success: true,
            message: 'Wallet disconnected',
        };
    }
    async getUserWallets(req) {
        const wallets = await this.connectWalletUseCase.getUserWallets(req.user.id);
        return {
            success: true,
            data: wallets.map((w) => ({
                id: w.id,
                walletAddress: w.walletAddress,
                shortAddress: w.getShortAddress(),
                walletType: w.walletType,
                status: w.status,
                isPrimary: w.isPrimary,
                connectedAt: w.connectedAt,
                explorerUrl: this.connectWalletUseCase.getExplorerUrl(w.walletAddress),
            })),
        };
    }
    async setPrimaryWallet(req, address) {
        await this.connectWalletUseCase.setPrimaryWallet(req.user.id, address);
        return {
            success: true,
            message: 'Primary wallet updated',
        };
    }
    async getTokenBalance(req) {
        const balance = await this.claimTokensUseCase.getTokenBalance(req.user.id);
        return {
            success: true,
            data: balance,
        };
    }
    async claimPendingTokens(req) {
        try {
            const result = await this.claimTokensUseCase.claimPendingTokens(req.user.id);
            return {
                success: true,
                data: {
                    claimed: result.claimed,
                    failed: result.failed,
                    distributions: result.distributions.map((d) => ({
                        id: d.id,
                        type: d.type,
                        amount: d.amount,
                        status: d.status,
                        transactionHash: d.transactionHash,
                        explorerUrl: d.getExplorerUrl(),
                    })),
                },
            };
        }
        catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to claim tokens',
            };
        }
    }
    async exchangeGemsForTokens(req, dto) {
        try {
            const distribution = await this.claimTokensUseCase.exchangeGemsForTokens(req.user.id, dto.gems);
            return {
                success: true,
                data: {
                    distributionId: distribution.id,
                    gemsExchanged: dto.gems,
                    tokensReceived: distribution.amount,
                    status: distribution.status,
                },
            };
        }
        catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to exchange gems',
            };
        }
    }
    async getDistributionHistory(req, limit) {
        const distributions = await this.claimTokensUseCase.getDistributionHistory(req.user.id, Math.min(limit, 100));
        return {
            success: true,
            data: distributions.map((d) => ({
                id: d.id,
                type: d.type,
                amount: d.amount,
                status: d.status,
                walletAddress: d.walletAddress,
                transactionHash: d.transactionHash,
                explorerUrl: d.getExplorerUrl(),
                metadata: d.metadata,
                createdAt: d.createdAt,
                processedAt: d.processedAt,
            })),
        };
    }
    async getDistributionStats(req) {
        const stats = await this.claimTokensUseCase.getDistributionStats(req.user.id);
        return {
            success: true,
            data: stats,
        };
    }
    async getBlockchainInfo() {
        return {
            success: true,
            data: {
                enabled: this.claimTokensUseCase.isBlockchainEnabled(),
                network: this.connectWalletUseCase.getNetwork(),
                tokenContract: this.claimTokensUseCase.getTokenContractAddress(),
                supportedWallets: Object.values(wallet_connection_entity_1.WalletType),
            },
        };
    }
};
exports.BlockchainController = BlockchainController;
__decorate([
    (0, common_1.Get)('wallet/payload'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "getConnectPayload", null);
__decorate([
    (0, common_1.Post)('wallet/connect'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, ConnectWalletDto]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "connectWallet", null);
__decorate([
    (0, common_1.Post)('wallet/disconnect/:address'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('address')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "disconnectWallet", null);
__decorate([
    (0, common_1.Get)('wallets'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "getUserWallets", null);
__decorate([
    (0, common_1.Post)('wallet/primary/:address'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('address')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "setPrimaryWallet", null);
__decorate([
    (0, common_1.Get)('tokens/balance'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "getTokenBalance", null);
__decorate([
    (0, common_1.Post)('tokens/claim'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "claimPendingTokens", null);
__decorate([
    (0, common_1.Post)('tokens/exchange'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, ExchangeGemsDto]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "exchangeGemsForTokens", null);
__decorate([
    (0, common_1.Get)('tokens/history'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(50), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "getDistributionHistory", null);
__decorate([
    (0, common_1.Get)('tokens/stats'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "getDistributionStats", null);
__decorate([
    (0, common_1.Get)('info'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "getBlockchainInfo", null);
exports.BlockchainController = BlockchainController = __decorate([
    (0, common_1.Controller)('blockchain'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [connect_wallet_use_case_1.ConnectWalletUseCase,
        claim_tokens_use_case_1.ClaimTokensUseCase])
], BlockchainController);
//# sourceMappingURL=blockchain.controller.js.map