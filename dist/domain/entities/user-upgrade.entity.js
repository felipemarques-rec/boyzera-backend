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
exports.UserUpgrade = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const upgrade_entity_1 = require("./upgrade.entity");
let UserUpgrade = class UserUpgrade {
    id;
    user;
    userId;
    upgrade;
    upgradeId;
    level;
};
exports.UserUpgrade = UserUpgrade;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], UserUpgrade.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], UserUpgrade.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UserUpgrade.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => upgrade_entity_1.Upgrade),
    (0, typeorm_1.JoinColumn)({ name: 'upgradeId' }),
    __metadata("design:type", upgrade_entity_1.Upgrade)
], UserUpgrade.prototype, "upgrade", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UserUpgrade.prototype, "upgradeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1 }),
    __metadata("design:type", Number)
], UserUpgrade.prototype, "level", void 0);
exports.UserUpgrade = UserUpgrade = __decorate([
    (0, typeorm_1.Entity)('user_upgrades')
], UserUpgrade);
//# sourceMappingURL=user-upgrade.entity.js.map