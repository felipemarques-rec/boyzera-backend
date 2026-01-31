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
exports.RouletteService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../../domain/entities/user.entity");
const roulette_prize_entity_1 = require("../../domain/entities/roulette-prize.entity");
const roulette_spin_entity_1 = require("../../domain/entities/roulette-spin.entity");
const DAYS_FOR_ROULETTE = 7;
let RouletteService = class RouletteService {
    userRepository;
    prizeRepository;
    spinRepository;
    constructor(userRepository, prizeRepository, spinRepository) {
        this.userRepository = userRepository;
        this.prizeRepository = prizeRepository;
        this.spinRepository = spinRepository;
    }
    async getStatus(userId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let canSpinToday = false;
        if (user.canSpinRoulette) {
            if (!user.lastRouletteSpinAt) {
                canSpinToday = true;
            }
            else {
                const lastSpinDate = new Date(user.lastRouletteSpinAt);
                lastSpinDate.setHours(0, 0, 0, 0);
                canSpinToday = lastSpinDate.getTime() < today.getTime();
            }
        }
        return {
            loginStreak: user.loginStreak,
            daysRequired: DAYS_FOR_ROULETTE,
            daysRemaining: Math.max(0, DAYS_FOR_ROULETTE - user.loginStreak),
            isUnlocked: user.canSpinRoulette,
            canSpinToday,
            lastSpinAt: user.lastRouletteSpinAt,
        };
    }
    async getPrizes() {
        const prizes = await this.prizeRepository.find({
            where: { isActive: true },
            order: { sortOrder: 'ASC' },
        });
        return prizes.map((prize) => ({
            id: prize.id,
            name: prize.name,
            description: prize.description,
            type: prize.type,
            imageUrl: prize.imageUrl,
            color: prize.color,
            isExclusive: prize.isExclusive,
        }));
    }
    async spin(userId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        if (!user.canSpinRoulette) {
            throw new common_1.BadRequestException(`You need ${DAYS_FOR_ROULETTE} consecutive login days to unlock the roulette`);
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (user.lastRouletteSpinAt) {
            const lastSpinDate = new Date(user.lastRouletteSpinAt);
            lastSpinDate.setHours(0, 0, 0, 0);
            if (lastSpinDate.getTime() >= today.getTime()) {
                throw new common_1.BadRequestException('You already spun the roulette today');
            }
        }
        const prizes = await this.prizeRepository.find({
            where: { isActive: true },
        });
        if (prizes.length === 0) {
            throw new common_1.BadRequestException('No prizes available');
        }
        const selectedPrize = this.selectPrizeByWeight(prizes);
        const rewardClaimed = await this.applyReward(user, selectedPrize);
        user.lastRouletteSpinAt = new Date();
        await this.userRepository.save(user);
        const spin = this.spinRepository.create({
            userId: user.id,
            prizeId: selectedPrize.id,
            rewardClaimed,
            loginStreakAtSpin: user.loginStreak,
        });
        await this.spinRepository.save(spin);
        return {
            prize: {
                id: selectedPrize.id,
                name: selectedPrize.name,
                description: selectedPrize.description,
                type: selectedPrize.type,
                imageUrl: selectedPrize.imageUrl,
                color: selectedPrize.color,
            },
            reward: rewardClaimed,
            spinId: spin.id,
        };
    }
    async getHistory(userId, limit = 10) {
        const spins = await this.spinRepository.find({
            where: { userId },
            relations: ['prize'],
            order: { createdAt: 'DESC' },
            take: limit,
        });
        return spins.map((spin) => ({
            id: spin.id,
            prize: {
                id: spin.prize.id,
                name: spin.prize.name,
                type: spin.prize.type,
                imageUrl: spin.prize.imageUrl,
            },
            reward: spin.rewardClaimed,
            loginStreakAtSpin: spin.loginStreakAtSpin,
            createdAt: spin.createdAt,
        }));
    }
    async handleUserLogin(payload) {
        await this.updateLoginStreak(payload.userId);
    }
    async updateLoginStreak(userId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            return;
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        let newStreak = 1;
        if (user.lastStreakDate) {
            const lastStreakDate = new Date(user.lastStreakDate);
            lastStreakDate.setHours(0, 0, 0, 0);
            if (lastStreakDate.getTime() === yesterday.getTime()) {
                newStreak = user.loginStreak + 1;
            }
            else if (lastStreakDate.getTime() === today.getTime()) {
                return;
            }
        }
        user.loginStreak = newStreak;
        user.lastStreakDate = new Date();
        if (newStreak >= DAYS_FOR_ROULETTE && !user.canSpinRoulette) {
            user.canSpinRoulette = true;
        }
        await this.userRepository.save(user);
    }
    selectPrizeByWeight(prizes) {
        const totalWeight = prizes.reduce((sum, prize) => sum + prize.probability, 0);
        let random = Math.random() * totalWeight;
        for (const prize of prizes) {
            random -= prize.probability;
            if (random <= 0) {
                return prize;
            }
        }
        return prizes[prizes.length - 1];
    }
    async applyReward(user, prize) {
        const reward = {};
        if (prize.reward?.followers) {
            user.followers = BigInt(user.followers) + BigInt(prize.reward.followers);
            reward.followers = prize.reward.followers;
        }
        if (prize.reward?.gems) {
            user.gems += prize.reward.gems;
            reward.gems = prize.reward.gems;
        }
        if (prize.reward?.energy) {
            user.energy = Math.min(user.energy + prize.reward.energy, user.maxEnergy);
            reward.energy = prize.reward.energy;
        }
        await this.userRepository.save(user);
        return reward;
    }
};
exports.RouletteService = RouletteService;
__decorate([
    (0, event_emitter_1.OnEvent)('user.login'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RouletteService.prototype, "handleUserLogin", null);
exports.RouletteService = RouletteService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(roulette_prize_entity_1.RoulettePrize)),
    __param(2, (0, typeorm_1.InjectRepository)(roulette_spin_entity_1.RouletteSpin)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], RouletteService);
//# sourceMappingURL=roulette.service.js.map