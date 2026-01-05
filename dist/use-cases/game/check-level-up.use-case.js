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
exports.CheckLevelUpUseCase = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const user_entity_1 = require("../../domain/entities/user.entity");
const level_service_1 = require("../../domain/services/level.service");
let CheckLevelUpUseCase = class CheckLevelUpUseCase {
    userRepository;
    levelService;
    eventEmitter;
    constructor(userRepository, levelService, eventEmitter) {
        this.userRepository = userRepository;
        this.levelService = levelService;
        this.eventEmitter = eventEmitter;
    }
    async execute(userId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new Error('User not found');
        }
        const result = await this.levelService.checkLevelUp(user);
        if (result.leveledUp && result.rewards) {
            user.level = result.newLevel;
            user.maxEnergy = result.rewards.maxEnergy;
            user.tapMultiplier = result.rewards.tapMultiplier;
            user.gems += result.rewards.gems;
            user.followers += result.rewards.followers;
            await this.userRepository.save(user);
            this.eventEmitter.emit('game.levelUp', {
                userId: user.id,
                previousLevel: result.previousLevel,
                newLevel: result.newLevel,
                rewards: result.rewards,
            });
        }
        return result;
    }
};
exports.CheckLevelUpUseCase = CheckLevelUpUseCase;
exports.CheckLevelUpUseCase = CheckLevelUpUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        level_service_1.LevelService,
        event_emitter_1.EventEmitter2])
], CheckLevelUpUseCase);
//# sourceMappingURL=check-level-up.use-case.js.map