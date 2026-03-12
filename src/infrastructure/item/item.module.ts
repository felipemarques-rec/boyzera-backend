import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameItem } from '../../domain/entities/game-item.entity';
import { UserItem } from '../../domain/entities/user-item.entity';
import { User } from '../../domain/entities/user.entity';
import { ItemService } from '../../domain/services/item.service';
import { ItemController } from '../../presentation/controllers/item.controller';

@Module({
  imports: [TypeOrmModule.forFeature([GameItem, UserItem, User])],
  providers: [ItemService],
  controllers: [ItemController],
  exports: [ItemService],
})
export class ItemModule {}
