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
exports.Challenge = exports.ChallengeStatus = exports.ChallengeType = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
var ChallengeType;
(function (ChallengeType) {
    ChallengeType["X1_TAP"] = "x1_tap";
    ChallengeType["TRUCO"] = "truco";
    ChallengeType["SPEED_TAP"] = "speed_tap";
    ChallengeType["MEMORY"] = "memory";
    ChallengeType["QUIZ"] = "quiz";
})(ChallengeType || (exports.ChallengeType = ChallengeType = {}));
var ChallengeStatus;
(function (ChallengeStatus) {
    ChallengeStatus["PENDING"] = "pending";
    ChallengeStatus["ACCEPTED"] = "accepted";
    ChallengeStatus["ONGOING"] = "ongoing";
    ChallengeStatus["COMPLETED"] = "completed";
    ChallengeStatus["CANCELLED"] = "cancelled";
    ChallengeStatus["EXPIRED"] = "expired";
})(ChallengeStatus || (exports.ChallengeStatus = ChallengeStatus = {}));
let Challenge = class Challenge {
    id;
    type;
    status;
    challengerId;
    challenger;
    opponentId;
    opponent;
    betAmount;
    config;
    result;
    prizePool;
    expiresAt;
    startedAt;
    endedAt;
    createdAt;
    updatedAt;
    isPending() {
        return this.status === ChallengeStatus.PENDING;
    }
    isOngoing() {
        return this.status === ChallengeStatus.ONGOING;
    }
    isCompleted() {
        return this.status === ChallengeStatus.COMPLETED;
    }
    canAccept() {
        if (this.status !== ChallengeStatus.PENDING)
            return false;
        if (this.expiresAt && new Date() > this.expiresAt)
            return false;
        return true;
    }
    getWinnerId() {
        if (!this.result)
            return null;
        return this.result.winnerId;
    }
    isParticipant(userId) {
        return this.challengerId === userId || this.opponentId === userId;
    }
    getOpponentFor(userId) {
        if (userId === this.challengerId)
            return this.opponentId;
        if (userId === this.opponentId)
            return this.challengerId;
        return null;
    }
};
exports.Challenge = Challenge;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Challenge.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ChallengeType,
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Challenge.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ChallengeStatus,
        default: ChallengeStatus.PENDING,
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Challenge.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Challenge.prototype, "challengerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'challengerId' }),
    __metadata("design:type", user_entity_1.User)
], Challenge.prototype, "challenger", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Challenge.prototype, "opponentId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'opponentId' }),
    __metadata("design:type", user_entity_1.User)
], Challenge.prototype, "opponent", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 30,
        scale: 0,
        default: '0',
        transformer: {
            to: (value) => value?.toString(),
            from: (value) => (value ? BigInt(value) : BigInt(0)),
        },
    }),
    __metadata("design:type", BigInt)
], Challenge.prototype, "betAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Challenge.prototype, "config", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Challenge.prototype, "result", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 30,
        scale: 0,
        default: '0',
        transformer: {
            to: (value) => value?.toString(),
            from: (value) => (value ? BigInt(value) : BigInt(0)),
        },
    }),
    __metadata("design:type", BigInt)
], Challenge.prototype, "prizePool", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Challenge.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Challenge.prototype, "startedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Challenge.prototype, "endedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Challenge.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Challenge.prototype, "updatedAt", void 0);
exports.Challenge = Challenge = __decorate([
    (0, typeorm_1.Entity)('challenges'),
    (0, typeorm_1.Index)(['challengerId', 'status']),
    (0, typeorm_1.Index)(['opponentId', 'status'])
], Challenge);
//# sourceMappingURL=challenge.entity.js.map