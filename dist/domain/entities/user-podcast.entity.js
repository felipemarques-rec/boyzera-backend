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
exports.UserPodcast = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const podcast_entity_1 = require("./podcast.entity");
let UserPodcast = class UserPodcast {
    id;
    userId;
    user;
    podcastId;
    podcast;
    isCompleted;
    rewardsClaimed;
    participatedAt;
    completedAt;
};
exports.UserPodcast = UserPodcast;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], UserPodcast.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UserPodcast.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], UserPodcast.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UserPodcast.prototype, "podcastId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => podcast_entity_1.Podcast),
    (0, typeorm_1.JoinColumn)({ name: 'podcastId' }),
    __metadata("design:type", podcast_entity_1.Podcast)
], UserPodcast.prototype, "podcast", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], UserPodcast.prototype, "isCompleted", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], UserPodcast.prototype, "rewardsClaimed", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], UserPodcast.prototype, "participatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], UserPodcast.prototype, "completedAt", void 0);
exports.UserPodcast = UserPodcast = __decorate([
    (0, typeorm_1.Entity)('user_podcasts'),
    (0, typeorm_1.Index)(['userId', 'podcastId'], { unique: true })
], UserPodcast);
//# sourceMappingURL=user-podcast.entity.js.map