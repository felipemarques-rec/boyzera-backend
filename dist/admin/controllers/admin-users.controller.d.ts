import { Repository } from 'typeorm';
import { User } from '../../domain/entities/user.entity';
interface UpdateUserDto {
    followers?: string;
    gems?: number;
    tokensBz?: number;
    energy?: number;
    maxEnergy?: number;
    level?: number;
    tapMultiplier?: number;
    profitPerHour?: number;
    isBanned?: boolean;
    banReason?: string;
}
interface BanUserDto {
    reason: string;
}
export declare class AdminUsersController {
    private userRepository;
    constructor(userRepository: Repository<User>);
    getUsers(page?: number, limit?: number, search?: string, isBanned?: string, level?: number, sortBy?: string, sortOrder?: 'ASC' | 'DESC'): Promise<{
        data: {
            id: string;
            telegramId: string;
            username: string;
            firstName: string;
            lastName: string;
            nickname: string;
            avatarUrl: string;
            followers: string;
            level: number;
            energy: number;
            maxEnergy: number;
            gems: number;
            tokensBz: number;
            totalTaps: string;
            tapMultiplier: number;
            profitPerHour: number;
            isBanned: boolean;
            banReason: string;
            createdAt: Date;
            updatedAt: Date;
            lastLoginAt: Date;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getStats(): Promise<{
        totalUsers: number;
        bannedUsers: number;
        activeToday: number;
        topLevel: any;
    }>;
    getUser(id: string): Promise<{
        error: string;
        id?: undefined;
        telegramId?: undefined;
        username?: undefined;
        firstName?: undefined;
        lastName?: undefined;
        nickname?: undefined;
        avatarUrl?: undefined;
        followers?: undefined;
        level?: undefined;
        energy?: undefined;
        maxEnergy?: undefined;
        energyRegenRate?: undefined;
        gems?: undefined;
        tokensBz?: undefined;
        totalTaps?: undefined;
        tapMultiplier?: undefined;
        profitPerHour?: undefined;
        combo?: undefined;
        engagement?: undefined;
        isBanned?: undefined;
        banReason?: undefined;
        referrerId?: undefined;
        seasonId?: undefined;
        createdAt?: undefined;
        updatedAt?: undefined;
        lastLoginAt?: undefined;
        lastTapAt?: undefined;
    } | {
        id: string;
        telegramId: string;
        username: string;
        firstName: string;
        lastName: string;
        nickname: string;
        avatarUrl: string;
        followers: string;
        level: number;
        energy: number;
        maxEnergy: number;
        energyRegenRate: number;
        gems: number;
        tokensBz: number;
        totalTaps: string;
        tapMultiplier: number;
        profitPerHour: number;
        combo: number;
        engagement: number;
        isBanned: boolean;
        banReason: string;
        referrerId: string;
        seasonId: string;
        createdAt: Date;
        updatedAt: Date;
        lastLoginAt: Date;
        lastTapAt: Date;
        error?: undefined;
    }>;
    updateUser(id: string, dto: UpdateUserDto): Promise<{
        error: string;
        success?: undefined;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        error?: undefined;
    }>;
    banUser(id: string, dto: BanUserDto): Promise<{
        error: string;
        success?: undefined;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        error?: undefined;
    }>;
    unbanUser(id: string): Promise<{
        error: string;
        success?: undefined;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        error?: undefined;
    }>;
}
export {};
