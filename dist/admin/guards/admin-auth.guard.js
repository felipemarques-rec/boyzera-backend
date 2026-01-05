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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAuthGuard = exports.AdminRoles = exports.ADMIN_ROLES_KEY = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const admin_auth_service_1 = require("../services/admin-auth.service");
exports.ADMIN_ROLES_KEY = 'adminRoles';
const AdminRoles = (...roles) => Reflect.metadata(exports.ADMIN_ROLES_KEY, roles);
exports.AdminRoles = AdminRoles;
let AdminAuthGuard = class AdminAuthGuard {
    adminAuthService;
    reflector;
    constructor(adminAuthService, reflector) {
        this.adminAuthService = adminAuthService;
        this.reflector = reflector;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new common_1.UnauthorizedException('Token de admin não fornecido');
        }
        const token = authHeader.substring(7);
        const admin = await this.adminAuthService.validateAdminToken(token);
        if (!admin) {
            throw new common_1.UnauthorizedException('Token de admin inválido');
        }
        const requiredRoles = this.reflector.get(exports.ADMIN_ROLES_KEY, context.getHandler());
        if (requiredRoles && requiredRoles.length > 0) {
            if (!requiredRoles.includes(admin.role)) {
                throw new common_1.UnauthorizedException('Permissão insuficiente');
            }
        }
        request.admin = admin;
        return true;
    }
};
exports.AdminAuthGuard = AdminAuthGuard;
exports.AdminAuthGuard = AdminAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [admin_auth_service_1.AdminAuthService,
        core_1.Reflector])
], AdminAuthGuard);
//# sourceMappingURL=admin-auth.guard.js.map