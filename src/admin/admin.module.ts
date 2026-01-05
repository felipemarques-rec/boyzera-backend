import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Entities
import { AdminUser } from './entities/admin-user.entity';
import { AppConfig } from './entities/app-config.entity';
import { User } from '../domain/entities/user.entity';
import { Level } from '../domain/entities/level.entity';
import { Mission } from '../domain/entities/mission.entity';
import { Upgrade } from '../domain/entities/upgrade.entity';
import { Referral } from '../domain/entities/referral.entity';
import { Product } from '../domain/entities/product.entity';
import { Squad, SquadMember } from '../domain/entities/squad.entity';
import { Challenge } from '../domain/entities/challenge.entity';

// Services
import { AdminAuthService } from './services/admin-auth.service';

// Guards
import { AdminAuthGuard } from './guards/admin-auth.guard';

// Controllers
import { AdminAuthController } from './controllers/admin-auth.controller';
import { AdminUsersController } from './controllers/admin-users.controller';
import { AdminLevelsController } from './controllers/admin-levels.controller';
import { AdminMissionsController } from './controllers/admin-missions.controller';
import { AdminUpgradesController } from './controllers/admin-upgrades.controller';
import { AdminConfigController } from './controllers/admin-config.controller';
import { AdminReferralsController } from './controllers/admin-referrals.controller';
import { AdminProductsController } from './controllers/admin-products.controller';
import { AdminSquadsController } from './controllers/admin-squads.controller';
import { AdminChallengesController } from './controllers/admin-challenges.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AdminUser,
      AppConfig,
      User,
      Level,
      Mission,
      Upgrade,
      Referral,
      Product,
      Squad,
      SquadMember,
      Challenge,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'admin-secret-key'),
        signOptions: {
          expiresIn: '8h',
        },
      }),
    }),
  ],
  controllers: [
    AdminAuthController,
    AdminUsersController,
    AdminLevelsController,
    AdminMissionsController,
    AdminUpgradesController,
    AdminConfigController,
    AdminReferralsController,
    AdminProductsController,
    AdminSquadsController,
    AdminChallengesController,
  ],
  providers: [AdminAuthService, AdminAuthGuard],
  exports: [AdminAuthService, AdminAuthGuard],
})
export class AdminModule {}
