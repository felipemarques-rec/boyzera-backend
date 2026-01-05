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
exports.AdminAuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const jwt_1 = require("@nestjs/jwt");
const admin_user_entity_1 = require("../entities/admin-user.entity");
let AdminAuthService = class AdminAuthService {
    adminUserRepository;
    jwtService;
    constructor(adminUserRepository, jwtService) {
        this.adminUserRepository = adminUserRepository;
        this.jwtService = jwtService;
    }
    async login(dto) {
        const admin = await this.adminUserRepository.findOne({
            where: { email: dto.email.toLowerCase() },
        });
        if (!admin) {
            throw new common_1.UnauthorizedException('Credenciais inválidas');
        }
        if (!admin.isActive) {
            throw new common_1.UnauthorizedException('Conta desativada');
        }
        const isPasswordValid = await admin.validatePassword(dto.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Credenciais inválidas');
        }
        admin.lastLoginAt = new Date();
        await this.adminUserRepository.save(admin);
        const payload = {
            sub: admin.id,
            email: admin.email,
            role: admin.role,
            type: 'admin',
        };
        const accessToken = this.jwtService.sign(payload, {
            expiresIn: '8h',
        });
        return {
            accessToken,
            admin: {
                id: admin.id,
                email: admin.email,
                name: admin.name,
                role: admin.role,
            },
        };
    }
    async validateAdminToken(token) {
        try {
            const payload = this.jwtService.verify(token);
            if (payload.type !== 'admin') {
                return null;
            }
            const admin = await this.adminUserRepository.findOne({
                where: { id: payload.sub },
            });
            if (!admin || !admin.isActive) {
                return null;
            }
            return admin;
        }
        catch {
            return null;
        }
    }
    async getAdminById(id) {
        return this.adminUserRepository.findOne({ where: { id } });
    }
    async createAdmin(data) {
        const existing = await this.adminUserRepository.findOne({
            where: { email: data.email.toLowerCase() },
        });
        if (existing) {
            throw new common_1.BadRequestException('Email já cadastrado');
        }
        const admin = this.adminUserRepository.create({
            email: data.email.toLowerCase(),
            password: data.password,
            name: data.name,
            role: data.role || admin_user_entity_1.AdminRole.ADMIN,
        });
        return this.adminUserRepository.save(admin);
    }
    async getAllAdmins() {
        return this.adminUserRepository.find({
            select: ['id', 'email', 'name', 'role', 'isActive', 'lastLoginAt', 'createdAt'],
            order: { createdAt: 'DESC' },
        });
    }
};
exports.AdminAuthService = AdminAuthService;
exports.AdminAuthService = AdminAuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(admin_user_entity_1.AdminUser)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService])
], AdminAuthService);
//# sourceMappingURL=admin-auth.service.js.map