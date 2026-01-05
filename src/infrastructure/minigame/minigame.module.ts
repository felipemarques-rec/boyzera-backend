import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MinigameScore } from '../../domain/entities/minigame-score.entity';
import { User } from '../../domain/entities/user.entity';
import { SubmitMinigameScoreUseCase } from '../../use-cases/minigame/submit-minigame-score.use-case';
import { GetMinigameLeaderboardUseCase } from '../../use-cases/minigame/get-minigame-leaderboard.use-case';
import { MinigameController } from '../../presentation/controllers/minigame.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MinigameScore, User])],
  controllers: [MinigameController],
  providers: [SubmitMinigameScoreUseCase, GetMinigameLeaderboardUseCase],
  exports: [SubmitMinigameScoreUseCase, GetMinigameLeaderboardUseCase],
})
export class MinigameModule {}
