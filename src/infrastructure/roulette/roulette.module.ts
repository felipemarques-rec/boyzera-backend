import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../domain/entities/user.entity';
import { RoulettePrize } from '../../domain/entities/roulette-prize.entity';
import { RouletteSpin } from '../../domain/entities/roulette-spin.entity';
import { RouletteService } from './roulette.service';
import { RouletteController } from '../../presentation/controllers/roulette.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, RoulettePrize, RouletteSpin])],
  controllers: [RouletteController],
  providers: [RouletteService],
  exports: [RouletteService],
})
export class RouletteModule {}
