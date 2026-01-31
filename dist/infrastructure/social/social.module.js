"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("../../domain/entities/user.entity");
const collaboration_entity_1 = require("../../domain/entities/collaboration.entity");
const user_collaboration_entity_1 = require("../../domain/entities/user-collaboration.entity");
const interview_entity_1 = require("../../domain/entities/interview.entity");
const user_interview_entity_1 = require("../../domain/entities/user-interview.entity");
const podcast_entity_1 = require("../../domain/entities/podcast.entity");
const user_podcast_entity_1 = require("../../domain/entities/user-podcast.entity");
const social_service_1 = require("./social.service");
const social_controller_1 = require("../../presentation/controllers/social.controller");
let SocialModule = class SocialModule {
};
exports.SocialModule = SocialModule;
exports.SocialModule = SocialModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                user_entity_1.User,
                collaboration_entity_1.Collaboration,
                user_collaboration_entity_1.UserCollaboration,
                interview_entity_1.Interview,
                user_interview_entity_1.UserInterview,
                podcast_entity_1.Podcast,
                user_podcast_entity_1.UserPodcast,
            ]),
        ],
        controllers: [social_controller_1.SocialController],
        providers: [social_service_1.SocialService],
        exports: [social_service_1.SocialService],
    })
], SocialModule);
//# sourceMappingURL=social.module.js.map