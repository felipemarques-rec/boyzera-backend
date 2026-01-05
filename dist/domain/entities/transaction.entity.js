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
exports.Transaction = exports.CurrencyType = exports.TransactionType = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
var TransactionType;
(function (TransactionType) {
    TransactionType["TAP"] = "tap";
    TransactionType["PASSIVE"] = "passive";
    TransactionType["PURCHASE"] = "purchase";
    TransactionType["REWARD"] = "reward";
    TransactionType["REFERRAL"] = "referral";
    TransactionType["TOKEN_EXCHANGE"] = "token_exchange";
    TransactionType["MISSION_REWARD"] = "mission_reward";
    TransactionType["LEVEL_UP"] = "level_up";
    TransactionType["SEASON_REWARD"] = "season_reward";
    TransactionType["UPGRADE_PURCHASE"] = "upgrade_purchase";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
var CurrencyType;
(function (CurrencyType) {
    CurrencyType["FOLLOWERS"] = "followers";
    CurrencyType["GEMS"] = "gems";
    CurrencyType["TOKENS_BZ"] = "tokens_bz";
})(CurrencyType || (exports.CurrencyType = CurrencyType = {}));
let Transaction = class Transaction {
    id;
    userId;
    user;
    type;
    currency;
    amount;
    balanceBefore;
    balanceAfter;
    metadata;
    seasonId;
    createdAt;
    isCredit() {
        return this.amount > BigInt(0);
    }
    isDebit() {
        return this.amount < BigInt(0);
    }
    getAbsoluteAmount() {
        return this.amount < BigInt(0) ? -this.amount : this.amount;
    }
    getFormattedAmount() {
        const abs = this.getAbsoluteAmount();
        const prefix = this.isDebit() ? '-' : '+';
        return `${prefix}${abs.toString()}`;
    }
};
exports.Transaction = Transaction;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Transaction.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Transaction.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], Transaction.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: TransactionType,
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Transaction.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: CurrencyType,
    }),
    __metadata("design:type", String)
], Transaction.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 30,
        scale: 0,
        transformer: {
            to: (value) => value?.toString(),
            from: (value) => (value ? BigInt(value) : BigInt(0)),
        },
    }),
    __metadata("design:type", BigInt)
], Transaction.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 30,
        scale: 0,
        nullable: true,
        transformer: {
            to: (value) => value?.toString() ?? null,
            from: (value) => (value ? BigInt(value) : null),
        },
    }),
    __metadata("design:type", Object)
], Transaction.prototype, "balanceBefore", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 30,
        scale: 0,
        nullable: true,
        transformer: {
            to: (value) => value?.toString() ?? null,
            from: (value) => (value ? BigInt(value) : null),
        },
    }),
    __metadata("design:type", Object)
], Transaction.prototype, "balanceAfter", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Transaction.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Transaction.prototype, "seasonId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Date)
], Transaction.prototype, "createdAt", void 0);
exports.Transaction = Transaction = __decorate([
    (0, typeorm_1.Entity)('transactions'),
    (0, typeorm_1.Index)(['userId', 'createdAt']),
    (0, typeorm_1.Index)(['type', 'createdAt'])
], Transaction);
//# sourceMappingURL=transaction.entity.js.map