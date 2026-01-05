import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { User } from '../../domain/entities/user.entity';
interface JwtPayload {
    sub: string;
    username: string;
}
declare const JwtStrategy_base: new (...args: any) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    private userRepository;
    private configService;
    constructor(userRepository: Repository<User>, configService: ConfigService);
    validate(payload: JwtPayload): Promise<User>;
}
export {};
