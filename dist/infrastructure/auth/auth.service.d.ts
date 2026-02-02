import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import { User } from '../../domain/entities/user.entity';
import { LoginDto } from './login.dto';
export declare class AuthService {
    private userRepository;
    private jwtService;
    private configService;
    private eventEmitter;
    constructor(userRepository: Repository<User>, jwtService: JwtService, configService: ConfigService, eventEmitter: EventEmitter2);
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
