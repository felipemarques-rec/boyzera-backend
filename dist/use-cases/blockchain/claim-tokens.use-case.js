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
exports.ClaimTokensUseCase = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const token_distribution_service_1 = require("../../infrastructure/blockchain/token-distribution.service");
const ton_connect_service_1 = require("../../infrastructure/blockchain/ton-connect.service");
const token_distribution_entity_1 = require("../../domain/entities/token-distribution.entity");
const user_entity_1 = require("../../domain/entities/user.entity");
let ClaimTokensUseCase = class ClaimTokensUseCase {
    tokenDistributionService;
    tonConnectService;
    userRepository;
    constructor(tokenDistributionService, tonConnectService, userRepository) {
        this.tokenDistributionService = tokenDistributionService;
        this.tonConnectService = tonConnectService;
        this.userRepository = userRepository;
    }
    async claimPendingTokens(userId) {
        const wallet = await this.tonConnectService.getPrimaryWallet(userId);
        if (!wallet) {
            throw new common_1.BadRequestException('No wallet connected. Please connect a wallet first.');
        }
        const distributions = await this.tokenDistributionService.getUserDistributions(userId);
        const pendingDistributions = distributions.filter((d) => d.status === token_distribution_entity_1.DistributionStatus.PENDING);
        if (pendingDistributions.length === 0) {
            return { claimed: 0, distributions: [], failed: 0 };
        }
        let claimed = 0;
        let failed = 0;
        const processedDistributions = [];
        for (const distribution of pendingDistributions) {
            const result = await this.tokenDistributionService.processDistribution(distribution.id);
            if (result.success) {
                claimed += distribution.amount;
            }
            else {
                failed++;
            }
            processedDistributions.push(result.distribution);
        }
        return {
            claimed,
            distributions: processedDistributions,
            failed,
        };
    }
    async exchangeGemsForTokens(userId, gems) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (gems < 100) {
            throw new common_1.BadRequestException('Minimum exchange is 100 gems');
        }
        if (user.gems < gems) {
            throw new common_1.BadRequestException('Insufficient gems');
        }
        const wallet = await this.tonConnectService.getPrimaryWallet(userId);
        if (!wallet) {
            throw new common_1.BadRequestException('No wallet connected. Please connect a wallet first.');
        }
        const distribution = await this.tokenDistributionService.exchangeGemsForTokens(userId, gems);
        return distribution;
    }
    async getTokenBalance(userId) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const stats = await this.tokenDistributionService.getDistributionStats(userId);
        return {
            confirmed: user.tokensBz,
            pending: stats.pendingAmount,
            total: user.tokensBz + stats.pendingAmount,
        };
    }
    async getDistributionHistory(userId, limit = 50) {
        return this.tokenDistributionService.getUserDistributions(userId, limit);
    }
    async getDistributionStats(userId) {
        return this.tokenDistributionService.getDistributionStats(userId);
    }
    isBlockchainEnabled() {
        return this.tokenDistributionService.isBlockchainEnabled();
    }
    getTokenContractAddress() {
        return this.tokenDistributionService.getTokenContractAddress();
    }
};
exports.ClaimTokensUseCase = ClaimTokensUseCase;
exports.ClaimTokensUseCase = ClaimTokensUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [token_distribution_service_1.TokenDistributionService,
        ton_connect_service_1.TonConnectService,
        typeorm_2.Repository])
], ClaimTokensUseCase);
//# sourceMappingURL=claim-tokens.use-case.js.map