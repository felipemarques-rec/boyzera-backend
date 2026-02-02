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
exports.AdminSocialController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const admin_auth_guard_1 = require("../guards/admin-auth.guard");
const collaboration_entity_1 = require("../../domain/entities/collaboration.entity");
const interview_entity_1 = require("../../domain/entities/interview.entity");
const podcast_entity_1 = require("../../domain/entities/podcast.entity");
let AdminSocialController = class AdminSocialController {
    collaborationRepository;
    interviewRepository;
    podcastRepository;
    constructor(collaborationRepository, interviewRepository, podcastRepository) {
        this.collaborationRepository = collaborationRepository;
        this.interviewRepository = interviewRepository;
        this.podcastRepository = podcastRepository;
    }
    async getCollaborations() {
        return this.collaborationRepository.find({
            order: { sortOrder: 'ASC', createdAt: 'DESC' },
        });
    }
    async getCollaboration(id) {
        return this.collaborationRepository.findOne({ where: { id } });
    }
    async createCollaboration(data) {
        const collab = this.collaborationRepository.create(data);
        return this.collaborationRepository.save(collab);
    }
    async updateCollaboration(id, data) {
        await this.collaborationRepository.update(id, data);
        return this.collaborationRepository.findOne({ where: { id } });
    }
    async deleteCollaboration(id) {
        await this.collaborationRepository.delete(id);
        return { success: true };
    }
    async getInterviews() {
        return this.interviewRepository.find({
            order: { sortOrder: 'ASC', createdAt: 'DESC' },
        });
    }
    async getInterview(id) {
        return this.interviewRepository.findOne({ where: { id } });
    }
    async createInterview(data) {
        const interview = this.interviewRepository.create(data);
        return this.interviewRepository.save(interview);
    }
    async updateInterview(id, data) {
        await this.interviewRepository.update(id, data);
        return this.interviewRepository.findOne({ where: { id } });
    }
    async deleteInterview(id) {
        await this.interviewRepository.delete(id);
        return { success: true };
    }
    async getPodcasts() {
        return this.podcastRepository.find({
            order: { sortOrder: 'ASC', createdAt: 'DESC' },
        });
    }
    async getPodcast(id) {
        return this.podcastRepository.findOne({ where: { id } });
    }
    async createPodcast(data) {
        const podcast = this.podcastRepository.create(data);
        return this.podcastRepository.save(podcast);
    }
    async updatePodcast(id, data) {
        await this.podcastRepository.update(id, data);
        return this.podcastRepository.findOne({ where: { id } });
    }
    async deletePodcast(id) {
        await this.podcastRepository.delete(id);
        return { success: true };
    }
    async getStats() {
        const collaborations = await this.collaborationRepository.count({ where: { isActive: true } });
        const interviews = await this.interviewRepository.count({ where: { isActive: true } });
        const podcasts = await this.podcastRepository.count({ where: { isActive: true } });
        return {
            collaborations,
            interviews,
            podcasts,
            total: collaborations + interviews + podcasts,
        };
    }
};
exports.AdminSocialController = AdminSocialController;
__decorate([
    (0, common_1.Get)('collaborations'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminSocialController.prototype, "getCollaborations", null);
__decorate([
    (0, common_1.Get)('collaborations/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminSocialController.prototype, "getCollaboration", null);
__decorate([
    (0, common_1.Post)('collaborations'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminSocialController.prototype, "createCollaboration", null);
__decorate([
    (0, common_1.Put)('collaborations/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminSocialController.prototype, "updateCollaboration", null);
__decorate([
    (0, common_1.Delete)('collaborations/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminSocialController.prototype, "deleteCollaboration", null);
__decorate([
    (0, common_1.Get)('interviews'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminSocialController.prototype, "getInterviews", null);
__decorate([
    (0, common_1.Get)('interviews/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminSocialController.prototype, "getInterview", null);
__decorate([
    (0, common_1.Post)('interviews'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminSocialController.prototype, "createInterview", null);
__decorate([
    (0, common_1.Put)('interviews/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminSocialController.prototype, "updateInterview", null);
__decorate([
    (0, common_1.Delete)('interviews/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminSocialController.prototype, "deleteInterview", null);
__decorate([
    (0, common_1.Get)('podcasts'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminSocialController.prototype, "getPodcasts", null);
__decorate([
    (0, common_1.Get)('podcasts/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminSocialController.prototype, "getPodcast", null);
__decorate([
    (0, common_1.Post)('podcasts'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminSocialController.prototype, "createPodcast", null);
__decorate([
    (0, common_1.Put)('podcasts/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminSocialController.prototype, "updatePodcast", null);
__decorate([
    (0, common_1.Delete)('podcasts/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminSocialController.prototype, "deletePodcast", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminSocialController.prototype, "getStats", null);
exports.AdminSocialController = AdminSocialController = __decorate([
    (0, common_1.Controller)('admin/social'),
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard),
    __param(0, (0, typeorm_1.InjectRepository)(collaboration_entity_1.Collaboration)),
    __param(1, (0, typeorm_1.InjectRepository)(interview_entity_1.Interview)),
    __param(2, (0, typeorm_1.InjectRepository)(podcast_entity_1.Podcast)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AdminSocialController);
//# sourceMappingURL=admin-social.controller.js.map