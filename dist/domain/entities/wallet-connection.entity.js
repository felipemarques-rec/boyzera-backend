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
exports.WalletConnection = exports.WalletStatus = exports.WalletType = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
var WalletType;
(function (WalletType) {
    WalletType["TON"] = "ton";
    WalletType["TONKEEPER"] = "tonkeeper";
    WalletType["MYTONWALLET"] = "mytonwallet";
    WalletType["OPENMASK"] = "openmask";
    WalletType["TONHUB"] = "tonhub";
})(WalletType || (exports.WalletType = WalletType = {}));
var WalletStatus;
(function (WalletStatus) {
    WalletStatus["PENDING"] = "pending";
    WalletStatus["CONNECTED"] = "connected";
    WalletStatus["DISCONNECTED"] = "disconnected";
    WalletStatus["EXPIRED"] = "expired";
})(WalletStatus || (exports.WalletStatus = WalletStatus = {}));
let WalletConnection = class WalletConnection {
    id;
    userId;
    user;
    walletType;
    walletAddress;
    status;
    connectionProof;
    metadata;
    isPrimary;
    connectedAt;
    disconnectedAt;
    createdAt;
    updatedAt;
    isConnected() {
        return this.status === WalletStatus.CONNECTED;
    }
    getShortAddress() {
        if (!this.walletAddress)
            return '';
        return `${this.walletAddress.slice(0, 6)}...${this.walletAddress.slice(-4)}`;
    }
};
exports.WalletConnection = WalletConnection;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], WalletConnection.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], WalletConnection.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], WalletConnection.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: WalletType,
        default: WalletType.TON,
    }),
    __metadata("design:type", String)
], WalletConnection.prototype, "walletType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 128 }),
    (0, typeorm_1.Index)({ unique: true }),
    __metadata("design:type", String)
], WalletConnection.prototype, "walletAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: WalletStatus,
        default: WalletStatus.PENDING,
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], WalletConnection.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], WalletConnection.prototype, "connectionProof", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], WalletConnection.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], WalletConnection.prototype, "isPrimary", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], WalletConnection.prototype, "connectedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], WalletConnection.prototype, "disconnectedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], WalletConnection.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], WalletConnection.prototype, "updatedAt", void 0);
exports.WalletConnection = WalletConnection = __decorate([
    (0, typeorm_1.Entity)('wallet_connections'),
    (0, typeorm_1.Index)(['userId', 'status']),
    (0, typeorm_1.Index)(['walletAddress', 'status'])
], WalletConnection);
//# sourceMappingURL=wallet-connection.entity.js.map