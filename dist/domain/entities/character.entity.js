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
exports.Character = exports.CharacterMood = exports.CharacterArea = void 0;
const typeorm_1 = require("typeorm");
var CharacterArea;
(function (CharacterArea) {
    CharacterArea["SOCIAL"] = "SOCIAL";
    CharacterArea["GARAGE"] = "GARAGE";
    CharacterArea["CLOSET"] = "CLOSET";
    CharacterArea["HOUSE"] = "HOUSE";
    CharacterArea["GAME"] = "GAME";
    CharacterArea["SHOP"] = "SHOP";
    CharacterArea["SQUAD"] = "SQUAD";
    CharacterArea["MISSIONS"] = "MISSIONS";
    CharacterArea["CHALLENGES"] = "CHALLENGES";
    CharacterArea["MINIGAMES"] = "MINIGAMES";
    CharacterArea["ROULETTE"] = "ROULETTE";
    CharacterArea["RAFFLES"] = "RAFFLES";
    CharacterArea["ACHIEVEMENTS"] = "ACHIEVEMENTS";
    CharacterArea["SEASONS"] = "SEASONS";
    CharacterArea["SYSTEM"] = "SYSTEM";
})(CharacterArea || (exports.CharacterArea = CharacterArea = {}));
var CharacterMood;
(function (CharacterMood) {
    CharacterMood["HAPPY"] = "HAPPY";
    CharacterMood["NEUTRAL"] = "NEUTRAL";
    CharacterMood["EXCITED"] = "EXCITED";
    CharacterMood["SAD"] = "SAD";
    CharacterMood["ANGRY"] = "ANGRY";
    CharacterMood["SURPRISED"] = "SURPRISED";
})(CharacterMood || (exports.CharacterMood = CharacterMood = {}));
let Character = class Character {
    id;
    name;
    displayName;
    description;
    avatarUrl;
    fullImageUrl;
    area;
    defaultMood;
    catchphrase;
    greetings;
    customColors;
    isActive;
    sortOrder;
    createdAt;
    updatedAt;
};
exports.Character = Character;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Character.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Character.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Character.prototype, "displayName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Character.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Character.prototype, "avatarUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Character.prototype, "fullImageUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: CharacterArea,
    }),
    __metadata("design:type", String)
], Character.prototype, "area", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: CharacterMood,
        default: CharacterMood.NEUTRAL,
    }),
    __metadata("design:type", String)
], Character.prototype, "defaultMood", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Character.prototype, "catchphrase", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], Character.prototype, "greetings", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Character.prototype, "customColors", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Character.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Character.prototype, "sortOrder", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Character.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Character.prototype, "updatedAt", void 0);
exports.Character = Character = __decorate([
    (0, typeorm_1.Entity)('characters')
], Character);
//# sourceMappingURL=character.entity.js.map