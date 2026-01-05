import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Season } from '../../domain/entities/season.entity';
import { User } from '../../domain/entities/user.entity';
import { Transaction } from '../../domain/entities/transaction.entity';
import { GetCurrentSeasonUseCase } from '../../use-cases/season/get-current-season.use-case';
import { CalculateSeasonRewardsUseCase } from '../../use-cases/season/calculate-season-rewards.use-case';
import { SeasonController } from '../../presentation/controllers/season.controller';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [TypeOrmModule.forFeature([Season, User, Transaction]), RedisModule],
  controllers: [SeasonController],
  providers: [GetCurrentSeasonUseCase, CalculateSeasonRewardsUseCase],
  exports: [GetCurrentSeasonUseCase, CalculateSeasonRewardsUseCase],
})
export class SeasonModule {}
