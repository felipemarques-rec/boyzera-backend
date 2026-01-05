import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AdminAuthService } from '../services/admin-auth.service';
import { AdminRole } from '../entities/admin-user.entity';

export const ADMIN_ROLES_KEY = 'adminRoles';
export const AdminRoles = (...roles: AdminRole[]) =>
  Reflect.metadata(ADMIN_ROLES_KEY, roles);

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(
    private adminAuthService: AdminAuthService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token de admin não fornecido');
    }

    const token = authHeader.substring(7);
    const admin = await this.adminAuthService.validateAdminToken(token);

    if (!admin) {
      throw new UnauthorizedException('Token de admin inválido');
    }

    // Check role requirements
    const requiredRoles = this.reflector.get<AdminRole[]>(
      ADMIN_ROLES_KEY,
      context.getHandler(),
    );

    if (requiredRoles && requiredRoles.length > 0) {
      if (!requiredRoles.includes(admin.role)) {
        throw new UnauthorizedException('Permissão insuficiente');
      }
    }

    // Attach admin to request
    request.admin = admin;
    return true;
  }
}
