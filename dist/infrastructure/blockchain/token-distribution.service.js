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
var TokenDistributionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenDistributionService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const token_distribution_entity_1 = require("../../domain/entities/token-distribution.entity");
const user_entity_1 = require("../../domain/entities/user.entity");
const wallet_connection_entity_1 = require("../../domain/entities/wallet-connection.entity");
let TokenDistributionService = TokenDistributionService_1 = class TokenDistributionService {
    configService;
    distributionRepository;
    userRepository;
    walletConnectionRepository;
    eventEmitter;
    logger = new common_1.Logger(TokenDistributionService_1.name);
    tokenContractAddress;
    isEnabled;
    constructor(configService, distributionRepository, userRepository, walletConnectionRepository, eventEmitter) {
        this.configService = configService;
        this.distributionRepository = distributionRepository;
        this.userRepository = userRepository;
        this.walletConnectionRepository = walletConnectionRepository;
        this.eventEmitter = eventEmitter;
        this.tokenContractAddress = this.configService.get('BZ_TOKEN_CONTRACT_ADDRESS', '');
        this.isEnabled = this.configService.get('BLOCKCHAIN_ENABLED', false);
    }
    async createDistribution(params) {
        const { userId, type, amount, seasonId, metadata } = params;
        const wallet = await this.walletConnectionRepository.findOne({
            where: { userId, status: wallet_connection_entity_1.WalletStatus.CONNECTED, isPrimary: true },
        });
        const distribution = this.distributionRepository.create({
            userId,
            type,
            status: token_distribution_entity_1.DistributionStatus.PENDING,
            amount,
            walletAddress: wallet?.walletAddress,
            seasonId,
            metadata,
        });
        await this.distributionRepository.save(distribution);
        this.logger.log(`Created distribution ${distribution.id} for user ${userId}: ${amount} BZ`);
        return distribution;
    }
    async processDistribution(distributionId) {
        const distribution = await this.distributionRepository.findOne({
            where: { id: distributionId },
            relations: ['user'],
        });
        if (!distribution) {
            throw new Error('Distribution not found');
        }
        if (distribution.status !== token_distribution_entity_1.DistributionStatus.PENDING) {
            throw new Error('Distribution is not pending');
        }
        if (!distribution.walletAddress) {
            distribution.status = token_distribution_entity_1.DistributionStatus.FAILED;
            distribution.errorMessage = 'No wallet connected';
            await this.distributionRepository.save(distribution);
            return {
                distribution,
                success: false,
                error: 'No wallet connected',
            };
        }
        distribution.status = token_distribution_entity_1.DistributionStatus.PROCESSING;
        await this.distributionRepository.save(distribution);
        try {
            const transactionHash = await this.sendTokens(distribution.walletAddress, distribution.amount);
            distribution.status = token_distribution_entity_1.DistributionStatus.COMPLETED;
            distribution.transactionHash = transactionHash;
            distribution.processedAt = new Date();
            await this.distributionRepository.save(distribution);
            const user = await this.userRepository.findOne({
                where: { id: distribution.userId },
            });
            if (user) {
                user.tokensBz += distribution.amount;
                await this.userRepository.save(user);
            }
            this.eventEmitter.emit('token.distributed', {
                distributionId: distribution.id,
                userId: distribution.userId,
                amount: distribution.amount,
                transactionHash,
            });
            this.logger.log(`Distribution ${distributionId} completed: ${transactionHash}`);
            return {
                distribution,
                transactionHash,
                success: true,
            };
        }
        catch (error) {
            distribution.status = token_distribution_entity_1.DistributionStatus.FAILED;
            distribution.errorMessage =
                error instanceof Error ? error.message : 'Unknown error';
            distribution.retryCount += 1;
            await this.distributionRepository.save(distribution);
            this.logger.error(`Distribution ${distributionId} failed: ${distribution.errorMessage}`);
            return {
                distribution,
                success: false,
                error: distribution.errorMessage,
            };
        }
    }
    async sendTokens(walletAddress, amount) {
        if (!this.isEnabled) {
            const mockHash = `0x${Buffer.from(`${walletAddress}:${amount}:${Date.now()}`)
                .toString('hex')
                .slice(0, 64)}`;
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return mockHash;
        }
        throw new Error('Blockchain integration not implemented');
    }
    async retryFailedDistribution(distributionId) {
        const distribution = await this.distributionRepository.findOne({
            where: { id: distributionId },
        });
        if (!distribution) {
            throw new Error('Distribution not found');
        }
        if (!distribution.canRetry()) {
            throw new Error('Distribution cannot be retried');
        }
        distribution.status = token_distribution_entity_1.DistributionStatus.PENDING;
        distribution.errorMessage = undefined;
        await this.distributionRepository.save(distribution);
        return this.processDistribution(distributionId);
    }
    async getPendingDistributions() {
        return this.distributionRepository.find({
            where: { status: token_distribution_entity_1.DistributionStatus.PENDING },
            order: { createdAt: 'ASC' },
        });
    }
    async getUserDistributions(userId, limit = 50) {
        return this.distributionRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
    async getDistributionStats(userId) {
        const distributions = await this.distributionRepository.find({
            where: { userId },
        });
        let totalDistributed = 0;
        let pendingAmount = 0;
        let completedCount = 0;
        let pendingCount = 0;
        for (const dist of distributions) {
            if (dist.status === token_distribution_entity_1.DistributionStatus.COMPLETED) {
                totalDistributed += dist.amount;
                completedCount++;
            }
            else if (dist.status === token_distribution_entity_1.DistributionStatus.PENDING) {
                pendingAmount += dist.amount;
                pendingCount++;
            }
        }
        return {
            totalDistributed,
            pendingAmount,
            completedCount,
            pendingCount,
        };
    }
    async createSeasonRewardDistributions(seasonId, rewards) {
        const distributions = [];
        for (const reward of rewards) {
            const distribution = await this.createDistribution({
                userId: reward.userId,
                type: token_distribution_entity_1.DistributionType.SEASON_REWARD,
                amount: reward.amount,
                seasonId,
                metadata: {
                    seasonRank: reward.rank,
                },
            });
            distributions.push(distribution);
        }
        this.logger.log(`Created ${distributions.length} season reward distributions for season ${seasonId}`);
        return distributions;
    }
    async exchangeGemsForTokens(userId, gems, exchangeRate = 0.01) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });
        if (!user) {
            throw new Error('User not found');
        }
        if (user.gems < gems) {
            throw new Error('Insufficient gems');
        }
        const tokenAmount = gems * exchangeRate;
        user.gems -= gems;
        await this.userRepository.save(user);
        const distribution = await this.createDistribution({
            userId,
            type: token_distribution_entity_1.DistributionType.EXCHANGE,
            amount: tokenAmount,
            metadata: {
                gemsExchanged: gems,
                reason: `Exchanged ${gems} gems for ${tokenAmount} BZ tokens`,
            },
        });
        return distribution;
    }
    isBlockchainEnabled() {
        return this.isEnabled;
    }
    getTokenContractAddress() {
        return this.tokenContractAddress;
    }
};
exports.TokenDistributionService = TokenDistributionService;
exports.TokenDistributionService = TokenDistributionService = TokenDistributionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(token_distribution_entity_1.TokenDistribution)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(3, (0, typeorm_1.InjectRepository)(wallet_connection_entity_1.WalletConnection)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        event_emitter_1.EventEmitter2])
], TokenDistributionService);
//# sourceMappingURL=token-distribution.service.js.map