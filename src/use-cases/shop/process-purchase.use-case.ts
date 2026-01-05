import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  Product,
  ProductCurrency,
  ProductType,
  BoosterType,
} from '../../domain/entities/product.entity';
import {
  Purchase,
  PurchaseStatus,
} from '../../domain/entities/purchase.entity';
import { User } from '../../domain/entities/user.entity';
import { UserBooster } from '../../domain/entities/user-booster.entity';

export interface ProcessPurchaseParams {
  userId: string;
  productId: string;
  telegramPaymentId?: string;
  metadata?: Record<string, any>;
}

export interface PurchaseResult {
  purchase: Purchase;
  reward: {
    gems?: number;
    followers?: bigint;
    energy?: number;
    booster?: {
      type: BoosterType;
      expiresAt: Date;
      multiplier: number;
    };
  };
}

@Injectable()
export class ProcessPurchaseUseCase {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Purchase)
    private purchaseRepository: Repository<Purchase>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserBooster)
    private userBoosterRepository: Repository<UserBooster>,
    private eventEmitter: EventEmitter2,
  ) {}

  async execute(params: ProcessPurchaseParams): Promise<PurchaseResult> {
    const { userId, productId, telegramPaymentId, metadata } = params;

    // Get user
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isBanned) {
      throw new BadRequestException('User is banned');
    }

    // Get product
    const product = await this.productRepository.findOne({
      where: { id: productId, isActive: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (!product.isAvailable()) {
      throw new BadRequestException('Product is not available');
    }

    // Check purchase limits
    if (product.metadata?.purchaseLimit) {
      const userPurchaseCount = await this.purchaseRepository.count({
        where: { userId, productId, status: PurchaseStatus.COMPLETED },
      });

      if (userPurchaseCount >= product.metadata.purchaseLimit) {
        throw new BadRequestException(
          'Purchase limit reached for this product',
        );
      }
    }

    // Validate and deduct currency
    await this.validateAndDeductCurrency(user, product);

    // Create purchase record
    const purchase = this.purchaseRepository.create({
      userId,
      productId,
      status: PurchaseStatus.COMPLETED,
      currency: product.currency,
      amount: product.price,
      reward: product.reward,
      rewardApplied: false,
      metadata: {
        telegramPaymentId,
        ...metadata,
      },
      completedAt: new Date(),
    });

    await this.purchaseRepository.save(purchase);

    // Apply rewards
    const rewardResult = await this.applyRewards(user, product, purchase);

    // Update purchase
    purchase.rewardApplied = true;
    await this.purchaseRepository.save(purchase);

    // Update product purchase count
    product.purchaseCount += 1;
    await this.productRepository.save(product);

    // Emit purchase event
    this.eventEmitter.emit('purchase.completed', {
      userId,
      productId,
      purchaseId: purchase.id,
      productType: product.type,
      amount: product.price,
      currency: product.currency,
    });

    return {
      purchase,
      reward: rewardResult,
    };
  }

  private async validateAndDeductCurrency(
    user: User,
    product: Product,
  ): Promise<void> {
    switch (product.currency) {
      case ProductCurrency.GEMS:
        if (user.gems < product.price) {
          throw new BadRequestException('Insufficient gems');
        }
        user.gems -= product.price;
        await this.userRepository.save(user);
        break;

      case ProductCurrency.FOLLOWERS:
        if (user.followers < BigInt(Math.floor(product.price))) {
          throw new BadRequestException('Insufficient followers');
        }
        user.followers -= BigInt(Math.floor(product.price));
        await this.userRepository.save(user);
        break;

      case ProductCurrency.STARS:
        // Telegram Stars are handled externally
        // We just record the purchase after verification
        break;

      default:
        throw new BadRequestException('Unsupported currency');
    }
  }

  private async applyRewards(
    user: User,
    product: Product,
    purchase: Purchase,
  ): Promise<PurchaseResult['reward']> {
    const result: PurchaseResult['reward'] = {};
    const reward = product.reward;

    // Apply gems
    if (reward.gems) {
      user.gems += reward.gems;
      result.gems = reward.gems;
    }

    // Apply followers
    if (reward.followers) {
      const followersToAdd = BigInt(reward.followers);
      user.followers += followersToAdd;
      result.followers = followersToAdd;
    }

    // Apply energy
    if (reward.energy) {
      user.energy = Math.min(user.energy + reward.energy, user.maxEnergy);
      result.energy = reward.energy;
    }

    // Save user updates
    await this.userRepository.save(user);

    // Apply booster
    if (reward.boosterType && reward.boosterDurationHours) {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + reward.boosterDurationHours);

      // Check for existing booster of same type
      const existingBooster = await this.userBoosterRepository.findOne({
        where: {
          userId: user.id,
          boosterType: reward.boosterType,
          isActive: true,
        },
      });

      if (existingBooster && !existingBooster.isExpired()) {
        // Extend existing booster
        existingBooster.expiresAt = new Date(
          existingBooster.expiresAt.getTime() +
            reward.boosterDurationHours * 60 * 60 * 1000,
        );
        await this.userBoosterRepository.save(existingBooster);
        result.booster = {
          type: reward.boosterType,
          expiresAt: existingBooster.expiresAt,
          multiplier: existingBooster.multiplier,
        };
      } else {
        // Create new booster
        const booster = this.userBoosterRepository.create({
          userId: user.id,
          boosterType: reward.boosterType,
          multiplier: reward.boosterMultiplier || 2,
          expiresAt,
          purchaseId: purchase.id,
          isActive: true,
        });
        await this.userBoosterRepository.save(booster);
        result.booster = {
          type: reward.boosterType,
          expiresAt,
          multiplier: booster.multiplier,
        };
      }
    }

    return result;
  }

  async getPurchaseHistory(
    userId: string,
    limit: number = 50,
  ): Promise<Purchase[]> {
    return this.purchaseRepository.find({
      where: { userId },
      relations: ['product'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getUserBoosters(userId: string): Promise<UserBooster[]> {
    const boosters = await this.userBoosterRepository.find({
      where: { userId, isActive: true },
      order: { expiresAt: 'ASC' },
    });

    // Filter out expired boosters
    return boosters.filter((b) => !b.isExpired());
  }

  async getActiveBoosterMultiplier(
    userId: string,
    boosterType: BoosterType,
  ): Promise<number> {
    const booster = await this.userBoosterRepository.findOne({
      where: { userId, boosterType, isActive: true },
    });

    if (!booster || booster.isExpired()) {
      return 1;
    }

    return booster.multiplier;
  }
}
