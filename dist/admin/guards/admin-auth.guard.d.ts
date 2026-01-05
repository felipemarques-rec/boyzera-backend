import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AdminAuthService } from '../services/admin-auth.service';
import { AdminRole } from '../entities/admin-user.entity';
export declare const ADMIN_ROLES_KEY = "adminRoles";
export declare const AdminRoles: (...roles: AdminRole[]) => {
    (target: Function): void;
    (target: Object, propertyKey: string | symbol): void;
};
export declare class AdminAuthGuard implements CanActivate {
    private adminAuthService;
    private reflector;
    constructor(adminAuthService: AdminAuthService, reflector: Reflector);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
