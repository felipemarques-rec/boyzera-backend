import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { User } from '../../domain/entities/user.entity';
import { AdminAuthGuard } from '../guards/admin-auth.guard';

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

@Controller('admin/users')
@UseGuards(AdminAuthGuard)
export class AdminUsersController {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  @Get()
  async getUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('search') search?: string,
    @Query('isBanned') isBanned?: string,
    @Query('level') level?: number,
    @Query('sortBy') sortBy: string = 'createdAt',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC',
  ) {
    const skip = (page - 1) * limit;

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    // Search filter
    if (search) {
      queryBuilder.andWhere(
        '(user.username ILIKE :search OR user.telegramId ILIKE :search OR user.firstName ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Banned filter
    if (isBanned !== undefined) {
      queryBuilder.andWhere('user.isBanned = :isBanned', {
        isBanned: isBanned === 'true',
      });
    }

    // Level filter
    if (level) {
      queryBuilder.andWhere('user.level = :level', { level });
    }

    // Sorting
    const validSortFields = ['createdAt', 'followers', 'level', 'gems', 'totalTaps'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(`user.${sortField}`, sortOrder);

    // Pagination
    const [users, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: users.map((user) => ({
        id: user.id,
        telegramId: user.telegramId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
        followers: user.followers.toString(),
        level: user.level,
        energy: user.energy,
        maxEnergy: user.maxEnergy,
        gems: user.gems,
        tokensBz: user.tokensBz,
        totalTaps: user.totalTaps.toString(),
        tapMultiplier: user.tapMultiplier,
        profitPerHour: user.profitPerHour,
        isBanned: user.isBanned,
        banReason: user.banReason,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLoginAt: user.lastLoginAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  @Get('stats')
  async getStats() {
    const totalUsers = await this.userRepository.count();
    const bannedUsers = await this.userRepository.count({ where: { isBanned: true } });
    const activeToday = await this.userRepository
      .createQueryBuilder('user')
      .where('user.lastLoginAt >= :date', {
        date: new Date(Date.now() - 24 * 60 * 60 * 1000),
      })
      .getCount();

    const topLevel = await this.userRepository
      .createQueryBuilder('user')
      .select('MAX(user.level)', 'maxLevel')
      .getRawOne();

    return {
      totalUsers,
      bannedUsers,
      activeToday,
      topLevel: topLevel?.maxLevel || 1,
    };
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      return { error: 'Usuário não encontrado' };
    }

    return {
      id: user.id,
      telegramId: user.telegramId,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
      followers: user.followers.toString(),
      level: user.level,
      energy: user.energy,
      maxEnergy: user.maxEnergy,
      energyRegenRate: user.energyRegenRate,
      gems: user.gems,
      tokensBz: user.tokensBz,
      totalTaps: user.totalTaps.toString(),
      tapMultiplier: user.tapMultiplier,
      profitPerHour: user.profitPerHour,
      combo: user.combo,
      engagement: user.engagement,
      isBanned: user.isBanned,
      banReason: user.banReason,
      referrerId: user.referrerId,
      seasonId: user.seasonId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt,
      lastTapAt: user.lastTapAt,
    };
  }

  @Patch(':id')
  async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      return { error: 'Usuário não encontrado' };
    }

    // Update allowed fields
    if (dto.followers !== undefined) {
      user.followers = BigInt(dto.followers);
    }
    if (dto.gems !== undefined) {
      user.gems = dto.gems;
    }
    if (dto.tokensBz !== undefined) {
      user.tokensBz = dto.tokensBz;
    }
    if (dto.energy !== undefined) {
      user.energy = dto.energy;
    }
    if (dto.maxEnergy !== undefined) {
      user.maxEnergy = dto.maxEnergy;
    }
    if (dto.level !== undefined) {
      user.level = dto.level;
    }
    if (dto.tapMultiplier !== undefined) {
      user.tapMultiplier = dto.tapMultiplier;
    }
    if (dto.profitPerHour !== undefined) {
      user.profitPerHour = dto.profitPerHour;
    }

    await this.userRepository.save(user);

    return { success: true, message: 'Usuário atualizado' };
  }

  @Post(':id/ban')
  async banUser(@Param('id') id: string, @Body() dto: BanUserDto) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      return { error: 'Usuário não encontrado' };
    }

    user.isBanned = true;
    user.banReason = dto.reason;
    await this.userRepository.save(user);

    return { success: true, message: 'Usuário banido' };
  }

  @Post(':id/unban')
  async unbanUser(@Param('id') id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      return { error: 'Usuário não encontrado' };
    }

    user.isBanned = false;
    (user as any).banReason = null;
    await this.userRepository.save(user);

    return { success: true, message: 'Usuário desbanido' };
  }
}
