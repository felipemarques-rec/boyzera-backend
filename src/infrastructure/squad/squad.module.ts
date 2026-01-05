import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Squad, SquadMember } from '../../domain/entities/squad.entity';
import { User } from '../../domain/entities/user.entity';
import { SquadService } from '../../domain/services/squad.service';
import { SquadController } from '../../presentation/controllers/squad.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Squad, SquadMember, User])],
  controllers: [SquadController],
  providers: [SquadService],
  exports: [SquadService],
})
export class SquadModule {}
