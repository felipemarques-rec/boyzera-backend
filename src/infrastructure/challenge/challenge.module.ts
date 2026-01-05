import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Challenge } from '../../domain/entities/challenge.entity';
import { User } from '../../domain/entities/user.entity';
import { CreateChallengeUseCase } from '../../use-cases/challenge/create-challenge.use-case';
import { AcceptChallengeUseCase } from '../../use-cases/challenge/accept-challenge.use-case';
import { CompleteChallengeUseCase } from '../../use-cases/challenge/complete-challenge.use-case';
import { ChallengeController } from '../../presentation/controllers/challenge.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Challenge, User])],
  controllers: [ChallengeController],
  providers: [
    CreateChallengeUseCase,
    AcceptChallengeUseCase,
    CompleteChallengeUseCase,
  ],
  exports: [
    CreateChallengeUseCase,
    AcceptChallengeUseCase,
    CompleteChallengeUseCase,
  ],
})
export class ChallengeModule {}
