import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { User } from '../../domain/entities/user.entity';
export interface ReferralLinkResult {
    link: string;
    code: string;
    telegramBotLink: string;
}
export declare class GetReferralLinkUseCase {
    private userRepository;
    private configService;
    private readonly botUsername;
    constructor(userRepository: Repository<User>, configService: ConfigService);
    execute(userId: string): Promise<ReferralLinkResult>;
    private generateReferralCode;
}
