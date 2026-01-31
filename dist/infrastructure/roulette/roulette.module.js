"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouletteModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("../../domain/entities/user.entity");
const roulette_prize_entity_1 = require("../../domain/entities/roulette-prize.entity");
const roulette_spin_entity_1 = require("../../domain/entities/roulette-spin.entity");
const roulette_service_1 = require("./roulette.service");
const roulette_controller_1 = require("../../presentation/controllers/roulette.controller");
let RouletteModule = class RouletteModule {
};
exports.RouletteModule = RouletteModule;
exports.RouletteModule = RouletteModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, roulette_prize_entity_1.RoulettePrize, roulette_spin_entity_1.RouletteSpin])],
        controllers: [roulette_controller_1.RouletteController],
        providers: [roulette_service_1.RouletteService],
        exports: [roulette_service_1.RouletteService],
    })
], RouletteModule);
//# sourceMappingURL=roulette.module.js.map