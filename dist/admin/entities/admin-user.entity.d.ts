export declare enum AdminRole {
    SUPER_ADMIN = "SUPER_ADMIN",
    ADMIN = "ADMIN",
    MODERATOR = "MODERATOR"
}
export declare class AdminUser {
    id: string;
    email: string;
    password: string;
    name: string;
    role: AdminRole;
    isActive: boolean;
    lastLoginAt: Date;
    createdAt: Date;
    updatedAt: Date;
    hashPassword(): Promise<void>;
    validatePassword(password: string): Promise<boolean>;
}
