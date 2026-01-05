import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from '../../domain/entities/notification.entity';
import { CreateNotificationUseCase } from '../../use-cases/notification/create-notification.use-case';
import { GetNotificationsUseCase } from '../../use-cases/notification/get-notifications.use-case';
import { MarkAsReadUseCase } from '../../use-cases/notification/mark-as-read.use-case';
import { NotificationController } from '../../presentation/controllers/notification.controller';
import { NotificationListener } from '../listeners/notification.listener';

@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  providers: [
    CreateNotificationUseCase,
    GetNotificationsUseCase,
    MarkAsReadUseCase,
    NotificationListener,
  ],
  controllers: [NotificationController],
  exports: [CreateNotificationUseCase],
})
export class NotificationModule {}
