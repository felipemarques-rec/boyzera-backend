import { AdminAuthService } from '../services/admin-auth.service';
import type { AdminLoginDto } from '../services/admin-auth.service';
export declare class AdminAuthController {
    private adminAuthService;
    constructor(adminAuthService: AdminAuthService);
    login(dto: AdminLoginDto): Promise<import("../services/admin-auth.service").AdminAuthResponse>;
    getMe(req: any): Promise<{
        id: any;
        email: any;
        name: any;
        role: any;
    }>;
    logout(): Promise<{
        success: boolean;
        message: string;
    }>;
}
