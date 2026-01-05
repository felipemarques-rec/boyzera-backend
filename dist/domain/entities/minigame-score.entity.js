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
exports.MinigameScore = exports.MinigameDifficulty = exports.MinigameType = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
var MinigameType;
(function (MinigameType) {
    MinigameType["QUIZ"] = "quiz";
    MinigameType["MEMORY"] = "memory";
    MinigameType["SPEED_TAP"] = "speed_tap";
    MinigameType["WORD_SCRAMBLE"] = "word_scramble";
    MinigameType["PATTERN_MATCH"] = "pattern_match";
})(MinigameType || (exports.MinigameType = MinigameType = {}));
var MinigameDifficulty;
(function (MinigameDifficulty) {
    MinigameDifficulty["EASY"] = "easy";
    MinigameDifficulty["MEDIUM"] = "medium";
    MinigameDifficulty["HARD"] = "hard";
})(MinigameDifficulty || (exports.MinigameDifficulty = MinigameDifficulty = {}));
let MinigameScore = class MinigameScore {
    id;
    userId;
    user;
    gameType;
    difficulty;
    score;
    highScore;
    followersEarned;
    gemsEarned;
    durationSeconds;
    metadata;
    createdAt;
    isHighScore() {
        return this.score > this.highScore;
    }
    getScorePerSecond() {
        if (this.durationSeconds === 0)
            return 0;
        return this.score / this.durationSeconds;
    }
};
exports.MinigameScore = MinigameScore;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], MinigameScore.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], MinigameScore.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], MinigameScore.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: MinigameType,
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], MinigameScore.prototype, "gameType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: MinigameDifficulty,
        default: MinigameDifficulty.MEDIUM,
    }),
    __metadata("design:type", String)
], MinigameScore.prototype, "difficulty", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], MinigameScore.prototype, "score", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], MinigameScore.prototype, "highScore", void 0);
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
], MinigameScore.prototype, "followersEarned", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], MinigameScore.prototype, "gemsEarned", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], MinigameScore.prototype, "durationSeconds", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], MinigameScore.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Date)
], MinigameScore.prototype, "createdAt", void 0);
exports.MinigameScore = MinigameScore = __decorate([
    (0, typeorm_1.Entity)('minigame_scores'),
    (0, typeorm_1.Index)(['userId', 'gameType']),
    (0, typeorm_1.Index)(['gameType', 'score'])
], MinigameScore);
//# sourceMappingURL=minigame-score.entity.js.map