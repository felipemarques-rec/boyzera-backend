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
exports.TransactionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const transaction_entity_1 = require("../entities/transaction.entity");
const user_entity_1 = require("../entities/user.entity");
let TransactionService = class TransactionService {
    transactionRepository;
    userRepository;
    constructor(transactionRepository, userRepository) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }
    async createTransaction(params) {
        const user = await this.userRepository.findOne({
            where: { id: params.userId },
        });
        if (!user) {
            throw new Error('User not found');
        }
        const balanceBefore = this.getUserBalance(user, params.currency);
        const balanceAfter = balanceBefore + params.amount;
        const transaction = this.transactionRepository.create({
            userId: params.userId,
            type: params.type,
            currency: params.currency,
            amount: params.amount,
            balanceBefore,
            balanceAfter,
            metadata: params.metadata,
            seasonId: params.seasonId,
        });
        return this.transactionRepository.save(transaction);
    }
    async createTransactionBatch(transactions) {
        const results = [];
        for (const params of transactions) {
            const transaction = await this.createTransaction(params);
            results.push(transaction);
        }
        return results;
    }
    getUserBalance(user, currency) {
        switch (currency) {
            case transaction_entity_1.CurrencyType.FOLLOWERS:
                return user.followers;
            case transaction_entity_1.CurrencyType.GEMS:
                return BigInt(user.gems);
            case transaction_entity_1.CurrencyType.TOKENS_BZ:
                return BigInt(Math.floor(user.tokensBz * 100));
            default:
                return BigInt(0);
        }
    }
    async getTransactionHistory(userId, options = {}) {
        const { limit = 50, offset = 0, type, currency, startDate, endDate, } = options;
        const queryBuilder = this.transactionRepository
            .createQueryBuilder('transaction')
            .where('transaction.userId = :userId', { userId })
            .orderBy('transaction.createdAt', 'DESC');
        if (type) {
            queryBuilder.andWhere('transaction.type = :type', { type });
        }
        if (currency) {
            queryBuilder.andWhere('transaction.currency = :currency', { currency });
        }
        if (startDate) {
            queryBuilder.andWhere('transaction.createdAt >= :startDate', {
                startDate,
            });
        }
        if (endDate) {
            queryBuilder.andWhere('transaction.createdAt <= :endDate', { endDate });
        }
        const [transactions, total] = await queryBuilder
            .skip(offset)
            .take(limit)
            .getManyAndCount();
        return { transactions, total };
    }
    async getTransactionSummary(userId, currency, startDate, endDate) {
        const queryBuilder = this.transactionRepository
            .createQueryBuilder('transaction')
            .where('transaction.userId = :userId', { userId })
            .andWhere('transaction.currency = :currency', { currency });
        if (startDate) {
            queryBuilder.andWhere('transaction.createdAt >= :startDate', {
                startDate,
            });
        }
        if (endDate) {
            queryBuilder.andWhere('transaction.createdAt <= :endDate', { endDate });
        }
        const transactions = await queryBuilder.getMany();
        const summary = {
            totalEarned: BigInt(0),
            totalSpent: BigInt(0),
            netBalance: BigInt(0),
            transactionCount: transactions.length,
            byType: {},
        };
        Object.values(transaction_entity_1.TransactionType).forEach((type) => {
            summary.byType[type] = BigInt(0);
        });
        for (const transaction of transactions) {
            const amount = transaction.amount;
            if (amount > BigInt(0)) {
                summary.totalEarned += amount;
            }
            else {
                summary.totalSpent += -amount;
            }
            summary.byType[transaction.type] += amount;
        }
        summary.netBalance = summary.totalEarned - summary.totalSpent;
        return summary;
    }
    async getDailyStats(userId, currency, days = 7) {
        const stats = [];
        for (let i = 0; i < days; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);
            const dayTransactions = await this.transactionRepository.find({
                where: {
                    userId,
                    currency,
                },
            });
            const filteredTransactions = dayTransactions.filter((t) => t.createdAt >= date && t.createdAt < nextDate);
            let earned = BigInt(0);
            let spent = BigInt(0);
            for (const transaction of filteredTransactions) {
                if (transaction.amount > BigInt(0)) {
                    earned += transaction.amount;
                }
                else {
                    spent += -transaction.amount;
                }
            }
            stats.push({
                date: date.toISOString().split('T')[0],
                earned,
                spent,
            });
        }
        return stats.reverse();
    }
};
exports.TransactionService = TransactionService;
exports.TransactionService = TransactionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], TransactionService);
//# sourceMappingURL=transaction.service.js.map