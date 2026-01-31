import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as crypto from 'crypto';
import { Repository } from 'typeorm';
import { User } from '../../domain/entities/user.entity';
import { LoginDto } from './login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
  ) {}

  async validateTelegramData(initData: string): Promise<any> {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    urlParams.delete('hash');

    const params: string[] = [];
    urlParams.forEach((val, key) => params.push(`${key}=${val}`));
    params.sort();

    const dataCheckString = params.join('\n');
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(this.configService.get<string>('TELEGRAM_BOT_TOKEN') || '')
      .digest();

    const hmac = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (hmac !== hash) {
      // For development loop, we might want to bypass if hash is missing or special debug token
      if (
        this.configService.get('NODE_ENV') === 'development' &&
        initData === 'debug'
      ) {
        return { id: 12345, first_name: 'Debug', username: 'debug_user' };
      }
      throw new UnauthorizedException('Invalid Telegram hash');
    }

    return JSON.parse(urlParams.get('user') || '{}');
  }

  async login(loginDto: LoginDto) {
    const telegramUser = await this.validateTelegramData(loginDto.initData);

    let user = await this.userRepository.findOne({
      where: { telegramId: telegramUser.id.toString() },
    });

    // Create default nickname from Telegram data
    const defaultNickname = telegramUser.username
      || `${telegramUser.first_name || ''}${telegramUser.last_name ? ' ' + telegramUser.last_name : ''}`.trim()
      || `User${telegramUser.id}`;

    if (!user) {
      user = this.userRepository.create({
        telegramId: telegramUser.id.toString(),
        username: telegramUser.username || null,
        firstName: telegramUser.first_name || null,
        lastName: telegramUser.last_name || null,
        nickname: defaultNickname,
        avatarUrl: telegramUser.photo_url || null,
        followers: BigInt(0),
        totalTaps: BigInt(0),
        level: 1,
        energy: 1000,
        maxEnergy: 1000,
        gems: 0,
        tokensBz: 0,
        combo: 0,
        tapMultiplier: 1,
        profitPerHour: 0,
        energyRegenRate: 1,
      });
      await this.userRepository.save(user);
    } else {
      // Update user data from Telegram on each login
      let needsUpdate = false;

      if (telegramUser.username && user.username !== telegramUser.username) {
        user.username = telegramUser.username;
        needsUpdate = true;
      }
      if (telegramUser.first_name && user.firstName !== telegramUser.first_name) {
        user.firstName = telegramUser.first_name;
        needsUpdate = true;
      }
      if (telegramUser.last_name && user.lastName !== telegramUser.last_name) {
        user.lastName = telegramUser.last_name;
        needsUpdate = true;
      }
      if (telegramUser.photo_url && user.avatarUrl !== telegramUser.photo_url) {
        user.avatarUrl = telegramUser.photo_url;
        needsUpdate = true;
      }
      // Set nickname if empty
      if (!user.nickname) {
        user.nickname = defaultNickname;
        needsUpdate = true;
      }

      if (needsUpdate) {
        await this.userRepository.save(user);
      }
    }

    const payload = { sub: user.id, username: user.username };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Emit login event for login streak tracking
    this.eventEmitter.emit('user.login', { userId: user.id });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        telegramId: user.telegramId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
        followers: user.followers?.toString() || '0',
        level: user.level,
        gems: user.gems,
        tokensBz: user.tokensBz,
      },
    };
  }
}
