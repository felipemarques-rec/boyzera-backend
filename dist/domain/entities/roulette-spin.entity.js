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
exports.RouletteSpin = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const roulette_prize_entity_1 = require("./roulette-prize.entity");
let RouletteSpin = class RouletteSpin {
    id;
    userId;
    user;
    prizeId;
    prize;
    rewardClaimed;
    loginStreakAtSpin;
    createdAt;
};
exports.RouletteSpin = RouletteSpin;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], RouletteSpin.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], RouletteSpin.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], RouletteSpin.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], RouletteSpin.prototype, "prizeId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => roulette_prize_entity_1.RoulettePrize),
    (0, typeorm_1.JoinColumn)({ name: 'prizeId' }),
    __metadata("design:type", roulette_prize_entity_1.RoulettePrize)
], RouletteSpin.prototype, "prize", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], RouletteSpin.prototype, "rewardClaimed", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], RouletteSpin.prototype, "loginStreakAtSpin", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], RouletteSpin.prototype, "createdAt", void 0);
exports.RouletteSpin = RouletteSpin = __decorate([
    (0, typeorm_1.Entity)('roulette_spins')
], RouletteSpin);
//# sourceMappingURL=roulette-spin.entity.js.map