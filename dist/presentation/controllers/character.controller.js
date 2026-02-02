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
exports.CharacterController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const character_service_1 = require("../../infrastructure/character/character.service");
let CharacterController = class CharacterController {
    characterService;
    constructor(characterService) {
        this.characterService = characterService;
    }
    async getCharacters() {
        const characters = await this.characterService.getActiveCharacters();
        return characters.map((c) => this.characterService.formatCharacter(c));
    }
    async getCharacterByArea(area) {
        const character = await this.characterService.getCharacterForArea(area.toUpperCase());
        return character ? this.characterService.formatCharacter(character) : null;
    }
    async getCharacter(id) {
        const character = await this.characterService.getCharacterById(id);
        return this.characterService.formatCharacter(character);
    }
    async getGreeting(id) {
        const greeting = await this.characterService.getRandomGreeting(id);
        return { greeting };
    }
};
exports.CharacterController = CharacterController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CharacterController.prototype, "getCharacters", null);
__decorate([
    (0, common_1.Get)('area/:area'),
    __param(0, (0, common_1.Param)('area')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CharacterController.prototype, "getCharacterByArea", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CharacterController.prototype, "getCharacter", null);
__decorate([
    (0, common_1.Get)(':id/greeting'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CharacterController.prototype, "getGreeting", null);
exports.CharacterController = CharacterController = __decorate([
    (0, common_1.Controller)('characters'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [character_service_1.CharacterService])
], CharacterController);
//# sourceMappingURL=character.controller.js.map