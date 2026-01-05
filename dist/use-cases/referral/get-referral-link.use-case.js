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
exports.GetReferralLinkUseCase = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../../domain/entities/user.entity");
let GetReferralLinkUseCase = class GetReferralLinkUseCase {
    userRepository;
    configService;
    botUsername;
    constructor(userRepository, configService) {
        this.userRepository = userRepository;
        this.configService = configService;
        this.botUsername = this.configService.get('TELEGRAM_BOT_USERNAME', 'BoyZueiraBot');
    }
    async execute(userId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new Error('User not found');
        }
        const code = this.generateReferralCode(user.telegramId);
        const telegramBotLink = `https://t.me/${this.botUsername}?start=ref_${code}`;
        return {
            link: telegramBotLink,
            code,
            telegramBotLink,
        };
    }
    generateReferralCode(telegramId) {
        const base = BigInt(telegramId);
        return base.toString(36).toUpperCase();
    }
};
exports.GetReferralLinkUseCase = GetReferralLinkUseCase;
exports.GetReferralLinkUseCase = GetReferralLinkUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        config_1.ConfigService])
], GetReferralLinkUseCase);
//# sourceMappingURL=get-referral-link.use-case.js.map