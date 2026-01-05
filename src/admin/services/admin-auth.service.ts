import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { AdminUser, AdminRole } from '../entities/admin-user.entity';

export interface AdminLoginDto {
  email: string;
  password: string;
}

export interface AdminTokenPayload {
  sub: string;
  email: string;
  role: AdminRole;
  type: 'admin';
}

export interface AdminAuthResponse {
  accessToken: string;
  admin: {
    id: string;
    email: string;
    name: string;
    role: AdminRole;
  };
}

@Injectable()
export class AdminAuthService {
  constructor(
    @InjectRepository(AdminUser)
    private adminUserRepository: Repository<AdminUser>,
    private jwtService: JwtService,
  ) {}

  async login(dto: AdminLoginDto): Promise<AdminAuthResponse> {
    const admin = await this.adminUserRepository.findOne({
      where: { email: dto.email.toLowerCase() },
    });

    if (!admin) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (!admin.isActive) {
      throw new UnauthorizedException('Conta desativada');
    }

    const isPasswordValid = await admin.validatePassword(dto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Update last login
    admin.lastLoginAt = new Date();
    await this.adminUserRepository.save(admin);

    const payload: AdminTokenPayload = {
      sub: admin.id,
      email: admin.email,
      role: admin.role,
      type: 'admin',
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '8h',
    });

    return {
      accessToken,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    };
  }

  async validateAdminToken(token: string): Promise<AdminUser | null> {
    try {
      const payload = this.jwtService.verify<AdminTokenPayload>(token);

      if (payload.type !== 'admin') {
        return null;
      }

      const admin = await this.adminUserRepository.findOne({
        where: { id: payload.sub },
      });

      if (!admin || !admin.isActive) {
        return null;
      }

      return admin;
    } catch {
      return null;
    }
  }

  async getAdminById(id: string): Promise<AdminUser | null> {
    return this.adminUserRepository.findOne({ where: { id } });
  }

  async createAdmin(data: {
    email: string;
    password: string;
    name?: string;
    role?: AdminRole;
  }): Promise<AdminUser> {
    const existing = await this.adminUserRepository.findOne({
      where: { email: data.email.toLowerCase() },
    });

    if (existing) {
      throw new BadRequestException('Email já cadastrado');
    }

    const admin = this.adminUserRepository.create({
      email: data.email.toLowerCase(),
      password: data.password,
      name: data.name,
      role: data.role || AdminRole.ADMIN,
    });

    return this.adminUserRepository.save(admin);
  }

  async getAllAdmins(): Promise<AdminUser[]> {
    return this.adminUserRepository.find({
      select: ['id', 'email', 'name', 'role', 'isActive', 'lastLoginAt', 'createdAt'],
      order: { createdAt: 'DESC' },
    });
  }
}
