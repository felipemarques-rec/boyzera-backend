import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ItemService } from '../../domain/services/item.service';
import { ItemCategory } from '../../domain/entities/game-item.entity';

@Controller('items')
@UseGuards(AuthGuard('jwt'))
export class ItemController {
  constructor(private itemService: ItemService) {}

  @Get()
  async getUserItems(
    @Request() req,
    @Query('category') category?: ItemCategory,
  ) {
    return this.itemService.getUserItems(req.user.id, category);
  }

  @Get('bonuses')
  async getEquippedBonuses(@Request() req) {
    return this.itemService.getEquippedBonuses(req.user.id);
  }

  @Post('check-unlocks')
  async checkUnlocks(@Request() req) {
    const unlocked = await this.itemService.checkAndUnlockItems(req.user.id);
    return {
      unlockedCount: unlocked.length,
      items: unlocked.map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        rarity: item.rarity,
      })),
    };
  }

  @Post(':itemId/equip')
  async equipItem(@Request() req, @Param('itemId') itemId: string) {
    return this.itemService.equipItem(req.user.id, itemId);
  }

  @Post(':itemId/unequip')
  async unequipItem(@Request() req, @Param('itemId') itemId: string) {
    await this.itemService.unequipItem(req.user.id, itemId);
    return { success: true };
  }
}
