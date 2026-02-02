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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const social_service_1 = require("../../infrastructure/social/social.service");
let SocialController = class SocialController {
    socialService;
    constructor(socialService) {
        this.socialService = socialService;
    }
    async getCollaborations(req) {
        return this.socialService.getCollaborations(req.user.id);
    }
    async participateInCollaboration(req, collaborationId) {
        return this.socialService.participateInCollaboration(req.user.id, collaborationId);
    }
    async completeCollaboration(req, collaborationId) {
        return this.socialService.completeCollaboration(req.user.id, collaborationId);
    }
    async getInterviews(req) {
        return this.socialService.getInterviews(req.user.id);
    }
    async participateInInterview(req, interviewId) {
        return this.socialService.participateInInterview(req.user.id, interviewId);
    }
    async getPodcasts(req) {
        return this.socialService.getPodcasts(req.user.id);
    }
    async participateInPodcast(req, podcastId) {
        return this.socialService.participateInPodcast(req.user.id, podcastId);
    }
};
exports.SocialController = SocialController;
__decorate([
    (0, common_1.Get)('collaborations'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "getCollaborations", null);
__decorate([
    (0, common_1.Post)('collaborations/:id/participate'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "participateInCollaboration", null);
__decorate([
    (0, common_1.Post)('collaborations/:id/complete'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "completeCollaboration", null);
__decorate([
    (0, common_1.Get)('interviews'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "getInterviews", null);
__decorate([
    (0, common_1.Post)('interviews/:id/participate'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "participateInInterview", null);
__decorate([
    (0, common_1.Get)('podcasts'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "getPodcasts", null);
__decorate([
    (0, common_1.Post)('podcasts/:id/participate'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "participateInPodcast", null);
exports.SocialController = SocialController = __decorate([
    (0, common_1.Controller)('social'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [social_service_1.SocialService])
], SocialController);
//# sourceMappingURL=social.controller.js.map