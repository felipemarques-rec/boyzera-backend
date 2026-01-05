import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { AdminUser, AdminRole } from '../entities/admin-user.entity';
export interface AdminLoginDto {
    email: string;
    password: string;
}
export interface AdminTokenPayload {
    sub: string;
    email: string;
    role: AdminRole;
    type: 'admin';
}
export interface AdminAuthResponse {
    accessToken: string;
    admin: {
        id: string;
        email: string;
        name: string;
        role: AdminRole;
    };
}
export declare class AdminAuthService {
    private adminUserRepository;
    private jwtService;
    constructor(adminUserRepository: Repository<AdminUser>, jwtService: JwtService);
    login(dto: AdminLoginDto): Promise<AdminAuthResponse>;
    validateAdminToken(token: string): Promise<AdminUser | null>;
    getAdminById(id: string): Promise<AdminUser | null>;
    createAdmin(data: {
        email: string;
        password: string;
        name?: string;
        role?: AdminRole;
    }): Promise<AdminUser>;
    getAllAdmins(): Promise<AdminUser[]>;
}
