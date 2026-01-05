import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { LoginDto } from './login.dto';
import { User } from '../../domain/entities/user.entity';
export declare class AuthController {
    private authService;
    private jwtService;
    private userRepository;
    constructor(authService: AuthService, jwtService: JwtService, userRepository: Repository<User>);
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
    refresh(body: {
        refreshToken: string;
    }): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
}
