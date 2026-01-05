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
exports.SquadMember = exports.Squad = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const bigint_transformer_1 = require("../../shared/utils/bigint.transformer");
let Squad = class Squad {
    id;
    name;
    description;
    imageUrl;
    bannerUrl;
    ownerId;
    owner;
    level;
    totalFollowers;
    memberCount;
    maxMembers;
    isOpen;
    isVerified;
    createdAt;
    updatedAt;
};
exports.Squad = Squad;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Squad.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Squad.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Squad.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Squad.prototype, "imageUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Squad.prototype, "bannerUrl", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Squad.prototype, "ownerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'ownerId' }),
    __metadata("design:type", user_entity_1.User)
], Squad.prototype, "owner", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1 }),
    __metadata("design:type", Number)
], Squad.prototype, "level", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'bigint',
        default: 0,
        transformer: bigint_transformer_1.bigintTransformer,
    }),
    __metadata("design:type", BigInt)
], Squad.prototype, "totalFollowers", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Squad.prototype, "memberCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 50 }),
    __metadata("design:type", Number)
], Squad.prototype, "maxMembers", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Squad.prototype, "isOpen", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Squad.prototype, "isVerified", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Squad.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Squad.prototype, "updatedAt", void 0);
exports.Squad = Squad = __decorate([
    (0, typeorm_1.Entity)('squads'),
    (0, typeorm_1.Index)(['name'])
], Squad);
let SquadMember = class SquadMember {
    id;
    squadId;
    squad;
    userId;
    user;
    role;
    contributedFollowers;
    joinedAt;
};
exports.SquadMember = SquadMember;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SquadMember.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SquadMember.prototype, "squadId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Squad),
    (0, typeorm_1.JoinColumn)({ name: 'squadId' }),
    __metadata("design:type", Squad)
], SquadMember.prototype, "squad", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SquadMember.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], SquadMember.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['owner', 'admin', 'member'],
        default: 'member',
    }),
    __metadata("design:type", String)
], SquadMember.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'bigint',
        default: 0,
        transformer: bigint_transformer_1.bigintTransformer,
    }),
    __metadata("design:type", BigInt)
], SquadMember.prototype, "contributedFollowers", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], SquadMember.prototype, "joinedAt", void 0);
exports.SquadMember = SquadMember = __decorate([
    (0, typeorm_1.Entity)('squad_members'),
    (0, typeorm_1.Index)(['squadId', 'userId'], { unique: true })
], SquadMember);
//# sourceMappingURL=squad.entity.js.map