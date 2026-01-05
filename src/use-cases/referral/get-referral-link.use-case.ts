import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../domain/entities/user.entity';

export interface ReferralLinkResult {
  link: string;
  code: string;
  telegramBotLink: string;
}

@Injectable()
export class GetReferralLinkUseCase {
  private readonly botUsername: string;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService,
  ) {
    this.botUsername = this.configService.get<string>(
      'TELEGRAM_BOT_USERNAME',
      'BoyZueiraBot',
    );
  }

  async execute(userId: string): Promise<ReferralLinkResult> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    // Use telegramId as referral code (unique per user)
    const code = this.generateReferralCode(user.telegramId);

    // Telegram deep link format
    const telegramBotLink = `https://t.me/${this.botUsername}?start=ref_${code}`;

    return {
      link: telegramBotLink,
      code,
      telegramBotLink,
    };
  }

  private generateReferralCode(telegramId: string): string {
    // Create a simple hash-like code from telegram ID
    // In production, you might want a more sophisticated approach
    const base = BigInt(telegramId);
    return base.toString(36).toUpperCase();
  }
}
