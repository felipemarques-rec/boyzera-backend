import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AdminAuthService } from '../services/admin-auth.service';
import type { AdminLoginDto } from '../services/admin-auth.service';
import { AdminAuthGuard } from '../guards/admin-auth.guard';

@Controller('admin/auth')
export class AdminAuthController {
  constructor(private adminAuthService: AdminAuthService) {}

  @Post('login')
  async login(@Body() dto: AdminLoginDto) {
    return this.adminAuthService.login(dto);
  }

  @UseGuards(AdminAuthGuard)
  @Get('me')
  async getMe(@Request() req) {
    const admin = req.admin;
    return {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    };
  }

  @UseGuards(AdminAuthGuard)
  @Post('logout')
  async logout() {
    // JWT is stateless, so logout is handled client-side
    return { success: true, message: 'Logout realizado' };
  }
}
