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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectWalletUseCase = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const ton_connect_service_1 = require("../../infrastructure/blockchain/ton-connect.service");
let ConnectWalletUseCase = class ConnectWalletUseCase {
    tonConnectService;
    eventEmitter;
    constructor(tonConnectService, eventEmitter) {
        this.tonConnectService = tonConnectService;
        this.eventEmitter = eventEmitter;
    }
    async generatePayload() {
        const payload = await this.tonConnectService.generatePayload();
        const expiresAt = Date.now() + 5 * 60 * 1000;
        return { payload, expiresAt };
    }
    async execute(params) {
        try {
            const connection = await this.tonConnectService.connectWallet(params);
            this.eventEmitter.emit('wallet.connected', {
                userId: params.userId,
                walletAddress: params.walletAddress,
                walletType: params.walletType,
            });
            return connection;
        }
        catch (error) {
            throw new common_1.BadRequestException(error instanceof Error ? error.message : 'Failed to connect wallet');
        }
    }
    async disconnect(userId, walletAddress) {
        await this.tonConnectService.disconnectWallet(userId, walletAddress);
        this.eventEmitter.emit('wallet.disconnected', {
            userId,
            walletAddress,
        });
    }
    async getUserWallets(userId) {
        return this.tonConnectService.getUserWallets(userId);
    }
    async getPrimaryWallet(userId) {
        return this.tonConnectService.getPrimaryWallet(userId);
    }
    async setPrimaryWallet(userId, walletAddress) {
        await this.tonConnectService.setPrimaryWallet(userId, walletAddress);
    }
    getExplorerUrl(address) {
        return this.tonConnectService.getExplorerUrl(address);
    }
    getNetwork() {
        return this.tonConnectService.getNetwork();
    }
};
exports.ConnectWalletUseCase = ConnectWalletUseCase;
exports.ConnectWalletUseCase = ConnectWalletUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ton_connect_service_1.TonConnectService,
        event_emitter_1.EventEmitter2])
], ConnectWalletUseCase);
//# sourceMappingURL=connect-wallet.use-case.js.map