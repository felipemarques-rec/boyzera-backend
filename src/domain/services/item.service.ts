import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import {
  GameItem,
  ItemCategory,
  EQUIP_SLOT_MAP,
  SLOT_LIMITS,
} from '../entities/game-item.entity';
import { UserItem } from '../entities/user-item.entity';

export interface ItemBonuses {
  totalEngagementBonus: number;
  totalFollowersPerHourBonus: number;
  equippedItems: { id: string; name: string; category: ItemCategory }[];
}

export interface UserItemInfo {
  id: string;
  itemId: string;
  name: string;
  description: string | null;
  category: ItemCategory;
  rarity: string;
  requiredFollowers: number;
  engagementBonus: number;
  followersPerHourBonus: number;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  brand: string | null;
  model: string | null;
  isUnlocked: boolean;
  isEquipped: boolean;
  unlockedAt: string | null;
}

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(GameItem)
    private gameItemRepository: Repository<GameItem>,
    @InjectRepository(UserItem)
    private userItemRepository: Repository<UserItem>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Retorna todos os itens com status de desbloqueio/equipamento do user.
   */
  async getUserItems(
    userId: string,
    category?: ItemCategory,
  ): Promise<UserItemInfo[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');

    const queryBuilder = this.gameItemRepository
      .createQueryBuilder('item')
      .where('item.isActive = true')
      .orderBy('item.requiredFollowers', 'ASC')
      .addOrderBy('item.sortOrder', 'ASC');

    if (category) {
      queryBuilder.andWhere('item.category = :category', { category });
    }

    const allItems = await queryBuilder.getMany();

    const userItems = await this.userItemRepository.find({
      where: { userId },
    });
    const userItemMap = new Map(userItems.map((ui) => [ui.itemId, ui]));

    const followers = Number(user.followers);

    return allItems.map((item) => {
      const userItem = userItemMap.get(item.id);
      const isUnlocked = !!userItem || followers >= item.requiredFollowers;

      return {
        id: userItem?.id || '',
        itemId: item.id,
        name: item.name,
        description: item.description,
        category: item.category,
        rarity: item.rarity,
        requiredFollowers: item.requiredFollowers,
        engagementBonus: item.engagementBonus,
        followersPerHourBonus: item.followersPerHourBonus,
        imageUrl: item.imageUrl,
        thumbnailUrl: item.thumbnailUrl,
        brand: item.brand,
        model: item.model,
        isUnlocked,
        isEquipped: userItem?.isEquipped || false,
        unlockedAt: userItem?.unlockedAt?.toISOString() || null,
      };
    });
  }

  /**
   * Verifica seguidores e desbloqueia itens novos.
   * Chamado após ganho de seguidores (tap, passive, etc).
   */
  async checkAndUnlockItems(userId: string): Promise<GameItem[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) return [];

    const followers = Number(user.followers);

    // Itens que o user ainda não tem e que pode desbloquear
    const unlockableItems = await this.gameItemRepository
      .createQueryBuilder('item')
      .where('item.isActive = true')
      .andWhere('item.requiredFollowers <= :followers', { followers })
      .andWhere(
        `item.id NOT IN (
          SELECT ui."itemId" FROM user_items ui WHERE ui."userId" = :userId
        )`,
        { userId },
      )
      .getMany();

    if (unlockableItems.length === 0) return [];

    // Criar registros de desbloqueio
    const newUserItems = unlockableItems.map((item) =>
      this.userItemRepository.create({
        userId,
        itemId: item.id,
        isEquipped: false,
      }),
    );

    await this.userItemRepository.save(newUserItems);

    return unlockableItems;
  }

  /**
   * Equipa um item. Valida slots e limites.
   */
  async equipItem(userId: string, itemId: string): Promise<UserItemInfo> {
    const userItem = await this.userItemRepository.findOne({
      where: { userId, itemId },
      relations: ['item'],
    });

    if (!userItem) {
      // Verificar se o item existe e se o user pode desbloquear
      const item = await this.gameItemRepository.findOne({ where: { id: itemId } });
      if (!item) throw new BadRequestException('Item not found');

      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user || Number(user.followers) < item.requiredFollowers) {
        throw new BadRequestException('Item not unlocked');
      }

      // Auto-unlock e equipar
      const newUserItem = this.userItemRepository.create({
        userId,
        itemId,
        isEquipped: false,
      });
      await this.userItemRepository.save(newUserItem);

      return this.equipItem(userId, itemId);
    }

    if (userItem.isEquipped) {
      throw new BadRequestException('Item already equipped');
    }

    const item = userItem.item;
    const slot = EQUIP_SLOT_MAP[item.category];
    const slotLimit = SLOT_LIMITS[slot];

    // Contar quantos itens do mesmo slot estão equipados
    const equippedInSlot = await this.userItemRepository
      .createQueryBuilder('ui')
      .innerJoin('ui.item', 'item')
      .where('ui.userId = :userId', { userId })
      .andWhere('ui.isEquipped = true')
      .andWhere('ui.id != :userItemId', { userItemId: userItem.id })
      .getMany();

    // Filtrar pelo mesmo slot
    const equippedInSameSlot: UserItem[] = [];
    for (const equipped of equippedInSlot) {
      const equippedItem = await this.gameItemRepository.findOne({
        where: { id: equipped.itemId },
      });
      if (equippedItem && EQUIP_SLOT_MAP[equippedItem.category] === slot) {
        equippedInSameSlot.push(equipped);
      }
    }

    if (equippedInSameSlot.length >= slotLimit) {
      // Desequipar o mais antigo para abrir espaço
      const oldest = equippedInSameSlot.sort(
        (a, b) => a.unlockedAt.getTime() - b.unlockedAt.getTime(),
      )[0];
      await this.userItemRepository.update(oldest.id, { isEquipped: false });
    }

    // Equipar
    userItem.isEquipped = true;
    await this.userItemRepository.save(userItem);

    return {
      id: userItem.id,
      itemId: item.id,
      name: item.name,
      description: item.description,
      category: item.category,
      rarity: item.rarity,
      requiredFollowers: item.requiredFollowers,
      engagementBonus: item.engagementBonus,
      followersPerHourBonus: item.followersPerHourBonus,
      imageUrl: item.imageUrl,
      thumbnailUrl: item.thumbnailUrl,
      brand: item.brand,
      model: item.model,
      isUnlocked: true,
      isEquipped: true,
      unlockedAt: userItem.unlockedAt?.toISOString() || null,
    };
  }

  /**
   * Desequipa um item.
   */
  async unequipItem(userId: string, itemId: string): Promise<void> {
    const userItem = await this.userItemRepository.findOne({
      where: { userId, itemId },
    });

    if (!userItem) throw new BadRequestException('Item not found in inventory');
    if (!userItem.isEquipped) throw new BadRequestException('Item not equipped');

    userItem.isEquipped = false;
    await this.userItemRepository.save(userItem);
  }

  /**
   * Calcula soma dos bônus de todos os itens equipados.
   */
  async getEquippedBonuses(userId: string): Promise<ItemBonuses> {
    const equippedItems = await this.userItemRepository.find({
      where: { userId, isEquipped: true },
      relations: ['item'],
    });

    let totalEngagementBonus = 0;
    let totalFollowersPerHourBonus = 0;
    const items: ItemBonuses['equippedItems'] = [];

    for (const ui of equippedItems) {
      if (ui.item) {
        totalEngagementBonus += ui.item.engagementBonus;
        totalFollowersPerHourBonus += ui.item.followersPerHourBonus;
        items.push({
          id: ui.item.id,
          name: ui.item.name,
          category: ui.item.category,
        });
      }
    }

    return {
      totalEngagementBonus,
      totalFollowersPerHourBonus,
      equippedItems: items,
    };
  }
}
