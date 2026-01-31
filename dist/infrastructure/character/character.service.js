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
exports.CharacterService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const character_entity_1 = require("../../domain/entities/character.entity");
let CharacterService = class CharacterService {
    characterRepository;
    constructor(characterRepository) {
        this.characterRepository = characterRepository;
    }
    async getActiveCharacters() {
        return this.characterRepository.find({
            where: { isActive: true },
            order: { sortOrder: 'ASC', name: 'ASC' },
        });
    }
    async getCharactersByArea(area) {
        return this.characterRepository.find({
            where: { area, isActive: true },
            order: { sortOrder: 'ASC' },
        });
    }
    async getCharacterForArea(area) {
        return this.characterRepository.findOne({
            where: { area, isActive: true },
            order: { sortOrder: 'ASC' },
        });
    }
    async getCharacterById(id) {
        const character = await this.characterRepository.findOne({
            where: { id },
        });
        if (!character) {
            throw new common_1.NotFoundException('Character not found');
        }
        return character;
    }
    async getRandomGreeting(characterId) {
        const character = await this.getCharacterById(characterId);
        if (!character.greetings || character.greetings.length === 0) {
            return character.catchphrase || null;
        }
        const randomIndex = Math.floor(Math.random() * character.greetings.length);
        return character.greetings[randomIndex];
    }
    formatCharacter(character) {
        return {
            id: character.id,
            name: character.name,
            displayName: character.displayName || character.name,
            description: character.description,
            avatarUrl: character.avatarUrl,
            fullImageUrl: character.fullImageUrl,
            area: character.area,
            defaultMood: character.defaultMood,
            catchphrase: character.catchphrase,
            customColors: character.customColors,
        };
    }
};
exports.CharacterService = CharacterService;
exports.CharacterService = CharacterService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(character_entity_1.Character)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CharacterService);
//# sourceMappingURL=character.service.js.map