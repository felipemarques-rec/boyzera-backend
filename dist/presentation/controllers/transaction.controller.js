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
exports.TransactionController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const get_transaction_history_use_case_1 = require("../../use-cases/transaction/get-transaction-history.use-case");
const transaction_entity_1 = require("../../domain/entities/transaction.entity");
let TransactionController = class TransactionController {
    getTransactionHistoryUseCase;
    constructor(getTransactionHistoryUseCase) {
        this.getTransactionHistoryUseCase = getTransactionHistoryUseCase;
    }
    async getTransactionHistory(req, page, limit, type, currency) {
        const userId = req.user.id;
        const result = await this.getTransactionHistoryUseCase.execute(userId, page, Math.min(limit, 100), { type, currency });
        return {
            success: true,
            data: {
                transactions: result.transactions.map((tx) => ({
                    id: tx.id,
                    type: tx.type,
                    currency: tx.currency,
                    amount: tx.amount.toString(),
                    balanceBefore: tx.balanceBefore?.toString() ?? null,
                    balanceAfter: tx.balanceAfter?.toString() ?? null,
                    metadata: tx.metadata,
                    createdAt: tx.createdAt,
                })),
                pagination: {
                    page: result.page,
                    limit: result.limit,
                    total: result.total,
                    totalPages: result.totalPages,
                },
            },
        };
    }
    async getRecentActivity(req, limit) {
        const userId = req.user.id;
        const transactions = await this.getTransactionHistoryUseCase.getRecentActivity(userId, Math.min(limit, 20));
        return {
            success: true,
            data: transactions.map((tx) => ({
                id: tx.id,
                type: tx.type,
                currency: tx.currency,
                amount: tx.amount.toString(),
                metadata: tx.metadata,
                createdAt: tx.createdAt,
            })),
        };
    }
    async getTransactionSummary(req, currency = transaction_entity_1.CurrencyType.FOLLOWERS, startDate, endDate) {
        const userId = req.user.id;
        const summary = await this.getTransactionHistoryUseCase.getSummary(userId, currency, startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
        const byTypeStrings = {};
        for (const [key, value] of Object.entries(summary.byType)) {
            byTypeStrings[key] = value.toString();
        }
        return {
            success: true,
            data: {
                currency,
                totalEarned: summary.totalEarned.toString(),
                totalSpent: summary.totalSpent.toString(),
                netBalance: summary.netBalance.toString(),
                transactionCount: summary.transactionCount,
                byType: byTypeStrings,
            },
        };
    }
    async getDailyStats(req, currency = transaction_entity_1.CurrencyType.FOLLOWERS, days) {
        const userId = req.user.id;
        const stats = await this.getTransactionHistoryUseCase.getDailyStats(userId, currency, Math.min(days, 30));
        return {
            success: true,
            data: stats.map((day) => ({
                date: day.date,
                earned: day.earned.toString(),
                spent: day.spent.toString(),
            })),
        };
    }
    async getFollowerTransactions(req, page, limit) {
        const userId = req.user.id;
        const result = await this.getTransactionHistoryUseCase.getFollowerTransactions(userId, page, Math.min(limit, 100));
        return {
            success: true,
            data: {
                transactions: result.transactions.map((tx) => ({
                    id: tx.id,
                    type: tx.type,
                    amount: tx.amount.toString(),
                    metadata: tx.metadata,
                    createdAt: tx.createdAt,
                })),
                pagination: {
                    page: result.page,
                    limit: result.limit,
                    total: result.total,
                    totalPages: result.totalPages,
                },
            },
        };
    }
    async getGemTransactions(req, page, limit) {
        const userId = req.user.id;
        const result = await this.getTransactionHistoryUseCase.getGemTransactions(userId, page, Math.min(limit, 100));
        return {
            success: true,
            data: {
                transactions: result.transactions.map((tx) => ({
                    id: tx.id,
                    type: tx.type,
                    amount: tx.amount.toString(),
                    metadata: tx.metadata,
                    createdAt: tx.createdAt,
                })),
                pagination: {
                    page: result.page,
                    limit: result.limit,
                    total: result.total,
                    totalPages: result.totalPages,
                },
            },
        };
    }
    async getTokenTransactions(req, page, limit) {
        const userId = req.user.id;
        const result = await this.getTransactionHistoryUseCase.getTokenTransactions(userId, page, Math.min(limit, 100));
        return {
            success: true,
            data: {
                transactions: result.transactions.map((tx) => ({
                    id: tx.id,
                    type: tx.type,
                    amount: tx.amount.toString(),
                    metadata: tx.metadata,
                    createdAt: tx.createdAt,
                })),
                pagination: {
                    page: result.page,
                    limit: result.limit,
                    total: result.total,
                    totalPages: result.totalPages,
                },
            },
        };
    }
};
exports.TransactionController = TransactionController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(50), common_1.ParseIntPipe)),
    __param(3, (0, common_1.Query)('type')),
    __param(4, (0, common_1.Query)('currency')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "getTransactionHistory", null);
__decorate([
    (0, common_1.Get)('recent'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(10), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "getRecentActivity", null);
__decorate([
    (0, common_1.Get)('summary'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('currency')),
    __param(2, (0, common_1.Query)('startDate')),
    __param(3, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "getTransactionSummary", null);
__decorate([
    (0, common_1.Get)('daily-stats'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('currency')),
    __param(2, (0, common_1.Query)('days', new common_1.DefaultValuePipe(7), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "getDailyStats", null);
__decorate([
    (0, common_1.Get)('followers'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(50), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "getFollowerTransactions", null);
__decorate([
    (0, common_1.Get)('gems'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(50), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "getGemTransactions", null);
__decorate([
    (0, common_1.Get)('tokens'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(50), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "getTokenTransactions", null);
exports.TransactionController = TransactionController = __decorate([
    (0, common_1.Controller)('transactions'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [get_transaction_history_use_case_1.GetTransactionHistoryUseCase])
], TransactionController);
//# sourceMappingURL=transaction.controller.js.map