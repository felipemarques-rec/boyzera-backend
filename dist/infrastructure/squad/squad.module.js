"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SquadModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const squad_entity_1 = require("../../domain/entities/squad.entity");
const user_entity_1 = require("../../domain/entities/user.entity");
const squad_service_1 = require("../../domain/services/squad.service");
const squad_controller_1 = require("../../presentation/controllers/squad.controller");
let SquadModule = class SquadModule {
};
exports.SquadModule = SquadModule;
exports.SquadModule = SquadModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([squad_entity_1.Squad, squad_entity_1.SquadMember, user_entity_1.User])],
        controllers: [squad_controller_1.SquadController],
        providers: [squad_service_1.SquadService],
        exports: [squad_service_1.SquadService],
    })
], SquadModule);
//# sourceMappingURL=squad.module.js.map