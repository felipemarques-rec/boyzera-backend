import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../domain/entities/user.entity';
import { Collaboration } from '../../domain/entities/collaboration.entity';
import { UserCollaboration } from '../../domain/entities/user-collaboration.entity';
import { Interview } from '../../domain/entities/interview.entity';
import { UserInterview } from '../../domain/entities/user-interview.entity';
import { Podcast } from '../../domain/entities/podcast.entity';
import { UserPodcast } from '../../domain/entities/user-podcast.entity';
import { SocialService } from './social.service';
import { SocialController } from '../../presentation/controllers/social.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Collaboration,
      UserCollaboration,
      Interview,
      UserInterview,
      Podcast,
      UserPodcast,
    ]),
  ],
  controllers: [SocialController],
  providers: [SocialService],
  exports: [SocialService],
})
export class SocialModule {}
