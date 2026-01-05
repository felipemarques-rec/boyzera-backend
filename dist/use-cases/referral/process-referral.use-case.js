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
exports.ProcessReferralUseCase = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const user_entity_1 = require("../../domain/entities/user.entity");
const referral_entity_1 = require("../../domain/entities/referral.entity");
const redis_service_1 = require("../../infrastructure/redis/redis.service");
let ProcessReferralUseCase = class ProcessReferralUseCase {
    userRepository;
    referralRepository;
    dataSource;
    redisService;
    eventEmitter;
    signupBonus = BigInt(1000);
    referredBonus = BigInt(500);
    constructor(userRepository, referralRepository, dataSource, redisService, eventEmitter) {
        this.userRepository = userRepository;
        this.referralRepository = referralRepository;
        this.dataSource = dataSource;
        this.redisService = redisService;
        this.eventEmitter = eventEmitter;
    }
    async execute(referredUserId, referralCode) {
        const referrer = await this.findUserByReferralCode(referralCode);
        if (!referrer) {
            throw new common_1.BadRequestException('Invalid referral code');
        }
        const referredUser = await this.userRepository.findOne({
            where: { id: referredUserId },
        });
        if (!referredUser) {
            throw new common_1.BadRequestException('Referred user not found');
        }
        if (referredUser.referrerId) {
            throw new common_1.BadRequestException('User already has a referrer');
        }
        if (referrer.id === referredUserId) {
            throw new common_1.BadRequestException('Cannot refer yourself');
        }
        const existingReferral = await this.referralRepository.findOne({
            where: { referredId: referredUserId },
        });
        if (existingReferral) {
            throw new common_1.BadRequestException('User already referred');
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const referral = this.referralRepository.create({
                referrerId: referrer.id,
                referredId: referredUserId,
                totalEarnedFollowers: this.signupBonus,
                bonusClaimed: true,
            });
            await queryRunner.manager.save(referral);
            referrer.followers += this.signupBonus;
            await queryRunner.manager.save(referrer);
            referredUser.referrerId = referrer.id;
            referredUser.followers += this.referredBonus;
            await queryRunner.manager.save(referredUser);
            await queryRunner.commitTransaction();
            await this.redisService.zadd('leaderboard:global', Number(referrer.followers), referrer.id);
            await this.redisService.zadd('leaderboard:global', Number(referredUser.followers), referredUserId);
            const totalReferrals = await this.referralRepository.count({
                where: { referrerId: referrer.id },
            });
            this.eventEmitter.emit('referral.new', {
                userId: referrer.id,
                referredUserId,
                totalReferrals,
            });
            return {
                success: true,
                referrerId: referrer.id,
                referredId: referredUserId,
                bonusFollowers: this.signupBonus.toString(),
            };
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
    }
    async findUserByReferralCode(code) {
        try {
            const telegramId = parseInt(code, 36).toString();
            return this.userRepository.findOne({ where: { telegramId } });
        }
        catch {
            return null;
        }
    }
};
exports.ProcessReferralUseCase = ProcessReferralUseCase;
exports.ProcessReferralUseCase = ProcessReferralUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(referral_entity_1.Referral)),
    __param(2, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource,
        redis_service_1.RedisService,
        event_emitter_1.EventEmitter2])
], ProcessReferralUseCase);
//# sourceMappingURL=process-referral.use-case.js.map