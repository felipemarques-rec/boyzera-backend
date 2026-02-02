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
exports.RouletteController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const roulette_service_1 = require("../../infrastructure/roulette/roulette.service");
let RouletteController = class RouletteController {
    rouletteService;
    constructor(rouletteService) {
        this.rouletteService = rouletteService;
    }
    async getStatus(req) {
        return this.rouletteService.getStatus(req.user.id);
    }
    async getPrizes() {
        return this.rouletteService.getPrizes();
    }
    async spin(req) {
        return this.rouletteService.spin(req.user.id);
    }
    async getHistory(req, limit) {
        return this.rouletteService.getHistory(req.user.id, limit || 10);
    }
};
exports.RouletteController = RouletteController;
__decorate([
    (0, common_1.Get)('status'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RouletteController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Get)('prizes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RouletteController.prototype, "getPrizes", null);
__decorate([
    (0, common_1.Post)('spin'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RouletteController.prototype, "spin", null);
__decorate([
    (0, common_1.Get)('history'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], RouletteController.prototype, "getHistory", null);
exports.RouletteController = RouletteController = __decorate([
    (0, common_1.Controller)('roulette'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [roulette_service_1.RouletteService])
], RouletteController);
//# sourceMappingURL=roulette.controller.js.map