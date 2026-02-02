import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../domain/entities/user.entity';
import { Raffle } from '../../domain/entities/raffle.entity';
import { RaffleTicket } from '../../domain/entities/raffle-ticket.entity';
import { RaffleTask } from '../../domain/entities/raffle-task.entity';
import { UserRaffleTask } from '../../domain/entities/user-raffle-task.entity';
import { RaffleService } from './raffle.service';
import { RaffleController } from '../../presentation/controllers/raffle.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Raffle,
      RaffleTicket,
      RaffleTask,
      UserRaffleTask,
    ]),
  ],
  controllers: [RaffleController],
  providers: [RaffleService],
  exports: [RaffleService],
})
export class RaffleModule {}
