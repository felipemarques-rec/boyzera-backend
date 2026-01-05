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
exports.CreateTransactionUseCase = void 0;
const common_1 = require("@nestjs/common");
const transaction_service_1 = require("../../domain/services/transaction.service");
const transaction_entity_1 = require("../../domain/entities/transaction.entity");
let CreateTransactionUseCase = class CreateTransactionUseCase {
    transactionService;
    constructor(transactionService) {
        this.transactionService = transactionService;
    }
    async execute(params) {
        return this.transactionService.createTransaction(params);
    }
    async recordTap(userId, followersEarned, tapCount) {
        return this.execute({
            userId,
            type: transaction_entity_1.TransactionType.TAP,
            currency: transaction_entity_1.CurrencyType.FOLLOWERS,
            amount: followersEarned,
            metadata: {
                tapCount,
                description: `Earned ${followersEarned.toString()} followers from ${tapCount} taps`,
            },
        });
    }
    async recordPassiveIncome(userId, followersEarned, hoursOffline) {
        return this.execute({
            userId,
            type: transaction_entity_1.TransactionType.PASSIVE,
            currency: transaction_entity_1.CurrencyType.FOLLOWERS,
            amount: followersEarned,
            metadata: {
                hoursOffline,
                description: `Collected ${followersEarned.toString()} followers from ${hoursOffline.toFixed(1)} hours offline`,
            },
        });
    }
    async recordUpgradePurchase(userId, cost, upgradeId, upgradeName) {
        return this.execute({
            userId,
            type: transaction_entity_1.TransactionType.UPGRADE_PURCHASE,
            currency: transaction_entity_1.CurrencyType.FOLLOWERS,
            amount: -cost,
            metadata: {
                upgradeId,
                upgradeName,
                description: `Purchased upgrade: ${upgradeName}`,
            },
        });
    }
    async recordMissionReward(userId, currency, amount, missionId, missionTitle) {
        return this.execute({
            userId,
            type: transaction_entity_1.TransactionType.MISSION_REWARD,
            currency,
            amount,
            metadata: {
                missionId,
                missionTitle,
                description: `Mission reward: ${missionTitle}`,
            },
        });
    }
    async recordLevelUp(userId, gems, followers, levelFrom, levelTo) {
        const transactions = [];
        const metadata = {
            levelFrom,
            levelTo,
            description: `Level up from ${levelFrom} to ${levelTo}`,
        };
        if (gems > 0) {
            const gemTransaction = await this.execute({
                userId,
                type: transaction_entity_1.TransactionType.LEVEL_UP,
                currency: transaction_entity_1.CurrencyType.GEMS,
                amount: BigInt(gems),
                metadata,
            });
            transactions.push(gemTransaction);
        }
        if (followers > BigInt(0)) {
            const followerTransaction = await this.execute({
                userId,
                type: transaction_entity_1.TransactionType.LEVEL_UP,
                currency: transaction_entity_1.CurrencyType.FOLLOWERS,
                amount: followers,
                metadata,
            });
            transactions.push(followerTransaction);
        }
        return transactions;
    }
    async recordReferralBonus(userId, followersEarned, referralId, referredUserId) {
        return this.execute({
            userId,
            type: transaction_entity_1.TransactionType.REFERRAL,
            currency: transaction_entity_1.CurrencyType.FOLLOWERS,
            amount: followersEarned,
            metadata: {
                referralId,
                referredUserId,
                description: 'Referral bonus',
            },
        });
    }
    async recordSeasonReward(userId, gems, followers, tokensBz, seasonId, seasonName, rank) {
        const transactions = [];
        const metadata = {
            seasonId,
            seasonName,
            description: `Season ${seasonName} reward - Rank #${rank}`,
        };
        if (gems > 0) {
            const gemTransaction = await this.execute({
                userId,
                type: transaction_entity_1.TransactionType.SEASON_REWARD,
                currency: transaction_entity_1.CurrencyType.GEMS,
                amount: BigInt(gems),
                metadata,
                seasonId,
            });
            transactions.push(gemTransaction);
        }
        if (followers > BigInt(0)) {
            const followerTransaction = await this.execute({
                userId,
                type: transaction_entity_1.TransactionType.SEASON_REWARD,
                currency: transaction_entity_1.CurrencyType.FOLLOWERS,
                amount: followers,
                metadata,
                seasonId,
            });
            transactions.push(followerTransaction);
        }
        if (tokensBz > 0) {
            const tokenTransaction = await this.execute({
                userId,
                type: transaction_entity_1.TransactionType.SEASON_REWARD,
                currency: transaction_entity_1.CurrencyType.TOKENS_BZ,
                amount: BigInt(Math.floor(tokensBz * 100)),
                metadata,
                seasonId,
            });
            transactions.push(tokenTransaction);
        }
        return transactions;
    }
    async recordTokenExchange(userId, gemsSpent, tokensReceived) {
        const metadata = {
            description: `Exchanged ${gemsSpent} gems for ${tokensReceived} BZ tokens`,
        };
        const gemTransaction = await this.execute({
            userId,
            type: transaction_entity_1.TransactionType.TOKEN_EXCHANGE,
            currency: transaction_entity_1.CurrencyType.GEMS,
            amount: BigInt(-gemsSpent),
            metadata,
        });
        const tokenTransaction = await this.execute({
            userId,
            type: transaction_entity_1.TransactionType.TOKEN_EXCHANGE,
            currency: transaction_entity_1.CurrencyType.TOKENS_BZ,
            amount: BigInt(Math.floor(tokensReceived * 100)),
            metadata,
        });
        return [gemTransaction, tokenTransaction];
    }
};
exports.CreateTransactionUseCase = CreateTransactionUseCase;
exports.CreateTransactionUseCase = CreateTransactionUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [transaction_service_1.TransactionService])
], CreateTransactionUseCase);
//# sourceMappingURL=create-transaction.use-case.js.map