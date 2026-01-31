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
exports.AdminRouletteController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const admin_auth_guard_1 = require("../guards/admin-auth.guard");
const roulette_prize_entity_1 = require("../../domain/entities/roulette-prize.entity");
const roulette_spin_entity_1 = require("../../domain/entities/roulette-spin.entity");
let AdminRouletteController = class AdminRouletteController {
    prizeRepository;
    spinRepository;
    constructor(prizeRepository, spinRepository) {
        this.prizeRepository = prizeRepository;
        this.spinRepository = spinRepository;
    }
    async getPrizes() {
        return this.prizeRepository.find({
            order: { sortOrder: 'ASC' },
        });
    }
    async getPrize(id) {
        return this.prizeRepository.findOne({ where: { id } });
    }
    async createPrize(data) {
        const prize = this.prizeRepository.create(data);
        return this.prizeRepository.save(prize);
    }
    async updatePrize(id, data) {
        await this.prizeRepository.update(id, data);
        return this.prizeRepository.findOne({ where: { id } });
    }
    async deletePrize(id) {
        await this.prizeRepository.delete(id);
        return { success: true };
    }
    async getSpins() {
        return this.spinRepository.find({
            relations: ['user', 'prize'],
            order: { createdAt: 'DESC' },
            take: 100,
        });
    }
    async getStats() {
        const totalSpins = await this.spinRepository.count();
        const todaySpins = await this.spinRepository
            .createQueryBuilder('spin')
            .where('DATE(spin.createdAt) = CURRENT_DATE')
            .getCount();
        const activePrizes = await this.prizeRepository.count({ where: { isActive: true } });
        return {
            totalSpins,
            todaySpins,
            activePrizes,
        };
    }
};
exports.AdminRouletteController = AdminRouletteController;
__decorate([
    (0, common_1.Get)('prizes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminRouletteController.prototype, "getPrizes", null);
__decorate([
    (0, common_1.Get)('prizes/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminRouletteController.prototype, "getPrize", null);
__decorate([
    (0, common_1.Post)('prizes'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminRouletteController.prototype, "createPrize", null);
__decorate([
    (0, common_1.Put)('prizes/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminRouletteController.prototype, "updatePrize", null);
__decorate([
    (0, common_1.Delete)('prizes/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminRouletteController.prototype, "deletePrize", null);
__decorate([
    (0, common_1.Get)('spins'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminRouletteController.prototype, "getSpins", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminRouletteController.prototype, "getStats", null);
exports.AdminRouletteController = AdminRouletteController = __decorate([
    (0, common_1.Controller)('admin/roulette'),
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard),
    __param(0, (0, typeorm_1.InjectRepository)(roulette_prize_entity_1.RoulettePrize)),
    __param(1, (0, typeorm_1.InjectRepository)(roulette_spin_entity_1.RouletteSpin)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], AdminRouletteController);
//# sourceMappingURL=admin-roulette.controller.js.map