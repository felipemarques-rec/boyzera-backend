import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../domain/entities/user.entity';
import { Referral } from '../../domain/entities/referral.entity';
import { GetReferralLinkUseCase } from '../../use-cases/referral/get-referral-link.use-case';
import { ProcessReferralUseCase } from '../../use-cases/referral/process-referral.use-case';
import { GetReferralStatsUseCase } from '../../use-cases/referral/get-referral-stats.use-case';
import { ReferralController } from '../../presentation/controllers/referral.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Referral])],
  providers: [
    GetReferralLinkUseCase,
    ProcessReferralUseCase,
    GetReferralStatsUseCase,
  ],
  controllers: [ReferralController],
  exports: [ProcessReferralUseCase],
})
export class ReferralModule {}
