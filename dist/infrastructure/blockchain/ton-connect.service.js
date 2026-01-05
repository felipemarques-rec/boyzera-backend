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
var TonConnectService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TonConnectService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const wallet_connection_entity_1 = require("../../domain/entities/wallet-connection.entity");
const user_entity_1 = require("../../domain/entities/user.entity");
let TonConnectService = TonConnectService_1 = class TonConnectService {
    configService;
    walletConnectionRepository;
    userRepository;
    logger = new common_1.Logger(TonConnectService_1.name);
    tonNetwork;
    constructor(configService, walletConnectionRepository, userRepository) {
        this.configService = configService;
        this.walletConnectionRepository = walletConnectionRepository;
        this.userRepository = userRepository;
        this.tonNetwork = this.configService.get('TON_NETWORK', 'testnet');
    }
    async generatePayload() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 15);
        return Buffer.from(`${timestamp}:${random}`).toString('base64');
    }
    async verifyProof(walletAddress, proof) {
        try {
            const currentTime = Math.floor(Date.now() / 1000);
            const proofAge = currentTime - proof.timestamp;
            if (proofAge > 300) {
                this.logger.warn(`Proof expired for wallet ${walletAddress}`);
                return false;
            }
            if (this.configService.get('NODE_ENV') === 'development') {
                return true;
            }
            return true;
        }
        catch (error) {
            this.logger.error(`Proof verification failed: ${error}`);
            return false;
        }
    }
    async connectWallet(params) {
        const { userId, walletAddress, walletType, proof, walletInfo } = params;
        const isValid = await this.verifyProof(walletAddress, proof);
        if (!isValid) {
            throw new Error('Invalid wallet proof');
        }
        const existingConnection = await this.walletConnectionRepository.findOne({
            where: {
                walletAddress,
                status: wallet_connection_entity_1.WalletStatus.CONNECTED,
            },
        });
        if (existingConnection && existingConnection.userId !== userId) {
            throw new Error('Wallet is already connected to another account');
        }
        await this.walletConnectionRepository.update({ userId, status: wallet_connection_entity_1.WalletStatus.CONNECTED }, { status: wallet_connection_entity_1.WalletStatus.DISCONNECTED, isPrimary: false });
        const connection = this.walletConnectionRepository.create({
            userId,
            walletAddress,
            walletType,
            status: wallet_connection_entity_1.WalletStatus.CONNECTED,
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
    async disconnectWallet(userId, walletAddress) {
        await this.walletConnectionRepository.update({ userId, walletAddress, status: wallet_connection_entity_1.WalletStatus.CONNECTED }, {
            status: wallet_connection_entity_1.WalletStatus.DISCONNECTED,
            disconnectedAt: new Date(),
            isPrimary: false,
        });
        this.logger.log(`Wallet ${walletAddress} disconnected for user ${userId}`);
    }
    async getUserWallets(userId) {
        return this.walletConnectionRepository.find({
            where: { userId, status: wallet_connection_entity_1.WalletStatus.CONNECTED },
            order: { isPrimary: 'DESC', connectedAt: 'DESC' },
        });
    }
    async getPrimaryWallet(userId) {
        return this.walletConnectionRepository.findOne({
            where: { userId, status: wallet_connection_entity_1.WalletStatus.CONNECTED, isPrimary: true },
        });
    }
    async getWalletByAddress(walletAddress) {
        return this.walletConnectionRepository.findOne({
            where: { walletAddress, status: wallet_connection_entity_1.WalletStatus.CONNECTED },
            relations: ['user'],
        });
    }
    async setPrimaryWallet(userId, walletAddress) {
        await this.walletConnectionRepository.update({ userId, status: wallet_connection_entity_1.WalletStatus.CONNECTED }, { isPrimary: false });
        await this.walletConnectionRepository.update({ userId, walletAddress, status: wallet_connection_entity_1.WalletStatus.CONNECTED }, { isPrimary: true });
    }
    getExplorerUrl(address) {
        const baseUrl = this.tonNetwork === 'mainnet'
            ? 'https://tonscan.org/address/'
            : 'https://testnet.tonscan.org/address/';
        return `${baseUrl}${address}`;
    }
    getNetwork() {
        return this.tonNetwork;
    }
};
exports.TonConnectService = TonConnectService;
exports.TonConnectService = TonConnectService = TonConnectService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(wallet_connection_entity_1.WalletConnection)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.Repository,
        typeorm_2.Repository])
], TonConnectService);
//# sourceMappingURL=ton-connect.service.js.map