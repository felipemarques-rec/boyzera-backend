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
exports.AdminCharactersController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const admin_auth_guard_1 = require("../guards/admin-auth.guard");
const character_entity_1 = require("../../domain/entities/character.entity");
let AdminCharactersController = class AdminCharactersController {
    characterRepository;
    constructor(characterRepository) {
        this.characterRepository = characterRepository;
    }
    async getCharacters() {
        return this.characterRepository.find({
            order: { area: 'ASC', sortOrder: 'ASC' },
        });
    }
    async getCharacter(id) {
        return this.characterRepository.findOne({ where: { id } });
    }
    async createCharacter(data) {
        const character = this.characterRepository.create(data);
        return this.characterRepository.save(character);
    }
    async updateCharacter(id, data) {
        await this.characterRepository.update(id, data);
        return this.characterRepository.findOne({ where: { id } });
    }
    async deleteCharacter(id) {
        await this.characterRepository.delete(id);
        return { success: true };
    }
    async getCharactersByArea(area) {
        return this.characterRepository.find({
            where: { area: area.toUpperCase(), isActive: true },
            order: { sortOrder: 'ASC' },
        });
    }
};
exports.AdminCharactersController = AdminCharactersController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminCharactersController.prototype, "getCharacters", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminCharactersController.prototype, "getCharacter", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminCharactersController.prototype, "createCharacter", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminCharactersController.prototype, "updateCharacter", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminCharactersController.prototype, "deleteCharacter", null);
__decorate([
    (0, common_1.Get)('by-area/:area'),
    __param(0, (0, common_1.Param)('area')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminCharactersController.prototype, "getCharactersByArea", null);
exports.AdminCharactersController = AdminCharactersController = __decorate([
    (0, common_1.Controller)('admin/characters'),
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard),
    __param(0, (0, typeorm_1.InjectRepository)(character_entity_1.Character)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AdminCharactersController);
//# sourceMappingURL=admin-characters.controller.js.map