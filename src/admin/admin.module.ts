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
import { RoulettePrize } from '../domain/entities/roulette-prize.entity';
import { RouletteSpin } from '../domain/entities/roulette-spin.entity';
import { Raffle } from '../domain/entities/raffle.entity';
import { RaffleTask } from '../domain/entities/raffle-task.entity';
import { RaffleTicket } from '../domain/entities/raffle-ticket.entity';
import { Collaboration } from '../domain/entities/collaboration.entity';
import { Interview } from '../domain/entities/interview.entity';
import { Podcast } from '../domain/entities/podcast.entity';
import { Character } from '../domain/entities/character.entity';

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
import { AdminRouletteController } from './controllers/admin-roulette.controller';
import { AdminRafflesController } from './controllers/admin-raffles.controller';
import { AdminSocialController } from './controllers/admin-social.controller';
import { AdminCharactersController } from './controllers/admin-characters.controller';

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
      RoulettePrize,
      RouletteSpin,
      Raffle,
      RaffleTask,
      RaffleTicket,
      Collaboration,
      Interview,
      Podcast,
      Character,
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
    AdminRouletteController,
    AdminRafflesController,
    AdminSocialController,
    AdminCharactersController,
  ],
  providers: [AdminAuthService, AdminAuthGuard],
  exports: [AdminAuthService, AdminAuthGuard],
})
export class AdminModule {}
