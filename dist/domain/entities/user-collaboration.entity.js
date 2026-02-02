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
exports.UserCollaboration = exports.UserCollaborationStatus = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const collaboration_entity_1 = require("./collaboration.entity");
var UserCollaborationStatus;
(function (UserCollaborationStatus) {
    UserCollaborationStatus["IN_PROGRESS"] = "IN_PROGRESS";
    UserCollaborationStatus["COMPLETED"] = "COMPLETED";
    UserCollaborationStatus["FAILED"] = "FAILED";
})(UserCollaborationStatus || (exports.UserCollaborationStatus = UserCollaborationStatus = {}));
let UserCollaboration = class UserCollaboration {
    id;
    userId;
    user;
    collaborationId;
    collaboration;
    status;
    completedAt;
    rewardsClaimed;
    startedAt;
};
exports.UserCollaboration = UserCollaboration;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], UserCollaboration.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UserCollaboration.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], UserCollaboration.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UserCollaboration.prototype, "collaborationId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => collaboration_entity_1.Collaboration),
    (0, typeorm_1.JoinColumn)({ name: 'collaborationId' }),
    __metadata("design:type", collaboration_entity_1.Collaboration)
], UserCollaboration.prototype, "collaboration", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: UserCollaborationStatus,
        default: UserCollaborationStatus.IN_PROGRESS,
    }),
    __metadata("design:type", String)
], UserCollaboration.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], UserCollaboration.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], UserCollaboration.prototype, "rewardsClaimed", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], UserCollaboration.prototype, "startedAt", void 0);
exports.UserCollaboration = UserCollaboration = __decorate([
    (0, typeorm_1.Entity)('user_collaborations'),
    (0, typeorm_1.Index)(['userId', 'collaborationId'], { unique: true })
], UserCollaboration);
//# sourceMappingURL=user-collaboration.entity.js.map