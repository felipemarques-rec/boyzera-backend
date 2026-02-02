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
exports.Podcast = exports.PodcastCategory = void 0;
const typeorm_1 = require("typeorm");
const bigint_transformer_1 = require("../../shared/utils/bigint.transformer");
var PodcastCategory;
(function (PodcastCategory) {
    PodcastCategory["ENTERTAINMENT"] = "ENTERTAINMENT";
    PodcastCategory["MUSIC"] = "MUSIC";
    PodcastCategory["LIFESTYLE"] = "LIFESTYLE";
    PodcastCategory["BUSINESS"] = "BUSINESS";
    PodcastCategory["COMEDY"] = "COMEDY";
})(PodcastCategory || (exports.PodcastCategory = PodcastCategory = {}));
let Podcast = class Podcast {
    id;
    title;
    description;
    category;
    hostName;
    hostAvatar;
    podcastName;
    imageUrl;
    audioUrl;
    durationMinutes;
    followersReward;
    gemsReward;
    engagementChange;
    requiredLevel;
    availableFrom;
    availableUntil;
    isActive;
    sortOrder;
    createdAt;
    updatedAt;
};
exports.Podcast = Podcast;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Podcast.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Podcast.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Podcast.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: PodcastCategory,
        default: PodcastCategory.ENTERTAINMENT,
    }),
    __metadata("design:type", String)
], Podcast.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Podcast.prototype, "hostName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Podcast.prototype, "hostAvatar", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Podcast.prototype, "podcastName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Podcast.prototype, "imageUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Podcast.prototype, "audioUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Podcast.prototype, "durationMinutes", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'bigint',
        default: 0,
        transformer: bigint_transformer_1.bigintTransformer,
    }),
    __metadata("design:type", BigInt)
], Podcast.prototype, "followersReward", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Podcast.prototype, "gemsReward", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', default: 0 }),
    __metadata("design:type", Number)
], Podcast.prototype, "engagementChange", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1 }),
    __metadata("design:type", Number)
], Podcast.prototype, "requiredLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Podcast.prototype, "availableFrom", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Podcast.prototype, "availableUntil", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Podcast.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Podcast.prototype, "sortOrder", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Podcast.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Podcast.prototype, "updatedAt", void 0);
exports.Podcast = Podcast = __decorate([
    (0, typeorm_1.Entity)('podcasts')
], Podcast);
//# sourceMappingURL=podcast.entity.js.map