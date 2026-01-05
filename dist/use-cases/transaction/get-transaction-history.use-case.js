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
exports.GetTransactionHistoryUseCase = void 0;
const common_1 = require("@nestjs/common");
const transaction_service_1 = require("../../domain/services/transaction.service");
const transaction_entity_1 = require("../../domain/entities/transaction.entity");
let GetTransactionHistoryUseCase = class GetTransactionHistoryUseCase {
    transactionService;
    constructor(transactionService) {
        this.transactionService = transactionService;
    }
    async execute(userId, page = 1, limit = 50, filters = {}) {
        const offset = (page - 1) * limit;
        const { transactions, total } = await this.transactionService.getTransactionHistory(userId, {
            limit,
            offset,
            type: filters.type,
            currency: filters.currency,
            startDate: filters.startDate,
            endDate: filters.endDate,
        });
        return {
            transactions,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getSummary(userId, currency, startDate, endDate) {
        return this.transactionService.getTransactionSummary(userId, currency, startDate, endDate);
    }
    async getDailyStats(userId, currency, days = 7) {
        return this.transactionService.getDailyStats(userId, currency, days);
    }
    async getRecentActivity(userId, limit = 10) {
        const { transactions } = await this.transactionService.getTransactionHistory(userId, { limit });
        return transactions;
    }
    async getTransactionsByType(userId, type, page = 1, limit = 50) {
        return this.execute(userId, page, limit, { type });
    }
    async getFollowerTransactions(userId, page = 1, limit = 50) {
        return this.execute(userId, page, limit, {
            currency: transaction_entity_1.CurrencyType.FOLLOWERS,
        });
    }
    async getGemTransactions(userId, page = 1, limit = 50) {
        return this.execute(userId, page, limit, { currency: transaction_entity_1.CurrencyType.GEMS });
    }
    async getTokenTransactions(userId, page = 1, limit = 50) {
        return this.execute(userId, page, limit, {
            currency: transaction_entity_1.CurrencyType.TOKENS_BZ,
        });
    }
};
exports.GetTransactionHistoryUseCase = GetTransactionHistoryUseCase;
exports.GetTransactionHistoryUseCase = GetTransactionHistoryUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [transaction_service_1.TransactionService])
], GetTransactionHistoryUseCase);
//# sourceMappingURL=get-transaction-history.use-case.js.map