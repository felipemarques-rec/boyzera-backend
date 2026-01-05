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
exports.TokenDistribution = exports.DistributionStatus = exports.DistributionType = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const season_entity_1 = require("./season.entity");
var DistributionType;
(function (DistributionType) {
    DistributionType["SEASON_REWARD"] = "season_reward";
    DistributionType["AIRDROP"] = "airdrop";
    DistributionType["REFERRAL_BONUS"] = "referral_bonus";
    DistributionType["ACHIEVEMENT"] = "achievement";
    DistributionType["EXCHANGE"] = "exchange";
    DistributionType["MANUAL"] = "manual";
})(DistributionType || (exports.DistributionType = DistributionType = {}));
var DistributionStatus;
(function (DistributionStatus) {
    DistributionStatus["PENDING"] = "pending";
    DistributionStatus["PROCESSING"] = "processing";
    DistributionStatus["COMPLETED"] = "completed";
    DistributionStatus["FAILED"] = "failed";
    DistributionStatus["CANCELLED"] = "cancelled";
})(DistributionStatus || (exports.DistributionStatus = DistributionStatus = {}));
let TokenDistribution = class TokenDistribution {
    id;
    userId;
    user;
    type;
    status;
    amount;
    walletAddress;
    transactionHash;
    seasonId;
    season;
    metadata;
    errorMessage;
    retryCount;
    processedAt;
    createdAt;
    updatedAt;
    isPending() {
        return this.status === DistributionStatus.PENDING;
    }
    isCompleted() {
        return this.status === DistributionStatus.COMPLETED;
    }
    canRetry() {
        return this.status === DistributionStatus.FAILED && this.retryCount < 3;
    }
    getExplorerUrl(network = 'mainnet') {
        if (!this.transactionHash)
            return null;
        const baseUrl = network === 'mainnet'
            ? 'https://tonscan.org/tx/'
            : 'https://testnet.tonscan.org/tx/';
        return `${baseUrl}${this.transactionHash}`;
    }
};
exports.TokenDistribution = TokenDistribution;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TokenDistribution.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], TokenDistribution.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], TokenDistribution.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: DistributionType,
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], TokenDistribution.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: DistributionStatus,
        default: DistributionStatus.PENDING,
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], TokenDistribution.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 8 }),
    __metadata("design:type", Number)
], TokenDistribution.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 128, nullable: true }),
    __metadata("design:type", String)
], TokenDistribution.prototype, "walletAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 128, nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], TokenDistribution.prototype, "transactionHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], TokenDistribution.prototype, "seasonId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => season_entity_1.Season, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'seasonId' }),
    __metadata("design:type", season_entity_1.Season)
], TokenDistribution.prototype, "season", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], TokenDistribution.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], TokenDistribution.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], TokenDistribution.prototype, "retryCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], TokenDistribution.prototype, "processedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], TokenDistribution.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], TokenDistribution.prototype, "updatedAt", void 0);
exports.TokenDistribution = TokenDistribution = __decorate([
    (0, typeorm_1.Entity)('token_distributions'),
    (0, typeorm_1.Index)(['userId', 'status']),
    (0, typeorm_1.Index)(['type', 'status']),
    (0, typeorm_1.Index)(['seasonId', 'status'])
], TokenDistribution);
//# sourceMappingURL=token-distribution.entity.js.map