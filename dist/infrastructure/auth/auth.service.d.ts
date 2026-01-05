import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../../domain/entities/user.entity';
import { LoginDto } from './login.dto';
export declare class AuthService {
    private userRepository;
    private jwtService;
    private configService;
    constructor(userRepository: Repository<User>, jwtService: JwtService, configService: ConfigService);
    validateTelegramData(initData: string): Promise<any>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: string;
            telegramId: string;
            username: string;
            firstName: string;
            lastName: string;
            nickname: string;
            avatarUrl: string;
            followers: string;
            level: number;
            gems: number;
            tokensBz: number;
        };
    }>;
}
