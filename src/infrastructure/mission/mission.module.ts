import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mission } from '../../domain/entities/mission.entity';
import { UserMission } from '../../domain/entities/user-mission.entity';
import { User } from '../../domain/entities/user.entity';
import { GetMissionsUseCase } from '../../use-cases/mission/get-missions.use-case';
import { UpdateMissionProgressUseCase } from '../../use-cases/mission/update-mission-progress.use-case';
import { ClaimMissionRewardUseCase } from '../../use-cases/mission/claim-mission-reward.use-case';
import { MissionListener } from '../listeners/mission.listener';
import { MissionController } from '../../presentation/controllers/mission.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Mission, UserMission, User])],
  providers: [
    GetMissionsUseCase,
    UpdateMissionProgressUseCase,
    ClaimMissionRewardUseCase,
    MissionListener,
  ],
  controllers: [MissionController],
  exports: [UpdateMissionProgressUseCase],
})
export class MissionModule {}
