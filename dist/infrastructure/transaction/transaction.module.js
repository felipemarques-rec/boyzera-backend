"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const transaction_entity_1 = require("../../domain/entities/transaction.entity");
const user_entity_1 = require("../../domain/entities/user.entity");
const transaction_service_1 = require("../../domain/services/transaction.service");
const create_transaction_use_case_1 = require("../../use-cases/transaction/create-transaction.use-case");
const get_transaction_history_use_case_1 = require("../../use-cases/transaction/get-transaction-history.use-case");
const transaction_controller_1 = require("../../presentation/controllers/transaction.controller");
let TransactionModule = class TransactionModule {
};
exports.TransactionModule = TransactionModule;
exports.TransactionModule = TransactionModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([transaction_entity_1.Transaction, user_entity_1.User])],
        controllers: [transaction_controller_1.TransactionController],
        providers: [
            transaction_service_1.TransactionService,
            create_transaction_use_case_1.CreateTransactionUseCase,
            get_transaction_history_use_case_1.GetTransactionHistoryUseCase,
        ],
        exports: [
            transaction_service_1.TransactionService,
            create_transaction_use_case_1.CreateTransactionUseCase,
            get_transaction_history_use_case_1.GetTransactionHistoryUseCase,
        ],
    })
], TransactionModule);
//# sourceMappingURL=transaction.module.js.map