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
exports.AdminConfigController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const app_config_entity_1 = require("../entities/app-config.entity");
const admin_auth_guard_1 = require("../guards/admin-auth.guard");
let AdminConfigController = class AdminConfigController {
    configRepository;
    constructor(configRepository) {
        this.configRepository = configRepository;
    }
    async getAllConfigs() {
        const configs = await this.configRepository.find({
            order: { key: 'ASC' },
        });
        return {
            data: configs,
            total: configs.length,
        };
    }
    async getConfig(key) {
        const config = await this.configRepository.findOne({ where: { key } });
        if (!config) {
            return { error: 'Configuracao nao encontrada' };
        }
        return config;
    }
    async setConfig(dto) {
        let config = await this.configRepository.findOne({ where: { key: dto.key } });
        if (config) {
            config.value = dto.value;
            if (dto.description !== undefined) {
                config.description = dto.description;
            }
        }
        else {
            config = this.configRepository.create({
                key: dto.key,
                value: dto.value,
                description: dto.description,
            });
        }
        await this.configRepository.save(config);
        return { success: true, message: 'Configuracao salva', data: config };
    }
    async updateConfig(key, dto) {
        const config = await this.configRepository.findOne({ where: { key } });
        if (!config) {
            return { error: 'Configuracao nao encontrada' };
        }
        config.value = dto.value;
        if (dto.description !== undefined) {
            config.description = dto.description;
        }
        await this.configRepository.save(config);
        return { success: true, message: 'Configuracao atualizada' };
    }
    async deleteConfig(key) {
        const config = await this.configRepository.findOne({ where: { key } });
        if (!config) {
            return { error: 'Configuracao nao encontrada' };
        }
        await this.configRepository.remove(config);
        return { success: true, message: 'Configuracao excluida' };
    }
    async bulkSetConfigs(configs) {
        const results = [];
        for (const dto of configs) {
            let config = await this.configRepository.findOne({ where: { key: dto.key } });
            if (config) {
                config.value = dto.value;
                if (dto.description !== undefined) {
                    config.description = dto.description;
                }
            }
            else {
                config = this.configRepository.create({
                    key: dto.key,
                    value: dto.value,
                    description: dto.description,
                });
            }
            await this.configRepository.save(config);
            results.push(config);
        }
        return { success: true, message: `${results.length} configuracoes salvas`, data: results };
    }
};
exports.AdminConfigController = AdminConfigController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminConfigController.prototype, "getAllConfigs", null);
__decorate([
    (0, common_1.Get)(':key'),
    __param(0, (0, common_1.Param)('key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminConfigController.prototype, "getConfig", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminConfigController.prototype, "setConfig", null);
__decorate([
    (0, common_1.Patch)(':key'),
    __param(0, (0, common_1.Param)('key')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminConfigController.prototype, "updateConfig", null);
__decorate([
    (0, common_1.Delete)(':key'),
    __param(0, (0, common_1.Param)('key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminConfigController.prototype, "deleteConfig", null);
__decorate([
    (0, common_1.Post)('bulk'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], AdminConfigController.prototype, "bulkSetConfigs", null);
exports.AdminConfigController = AdminConfigController = __decorate([
    (0, common_1.Controller)('admin/config'),
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard),
    __param(0, (0, typeorm_1.InjectRepository)(app_config_entity_1.AppConfig)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AdminConfigController);
//# sourceMappingURL=admin-config.controller.js.map