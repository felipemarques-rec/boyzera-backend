"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessPurchaseUseCase = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const product_entity_1 = require("../../domain/entities/product.entity");
const purchase_entity_1 = require("../../domain/entities/purchase.entity");
const user_entity_1 = require("../../domain/entities/user.entity");
const user_booster_entity_1 = require("../../domain/entities/user-booster.entity");
let ProcessPurchaseUseCase = class ProcessPurchaseUseCase {
    productRepository;
    purchaseRepository;
    userRepository;
    userBoosterRepository;
    eventEmitter;
    constructor(productRepository, purchaseRepository, userRepository, userBoosterRepository, eventEmitter) {
        this.productRepository = productRepository;
        this.purchaseRepository = purchaseRepository;
        this.userRepository = userRepository;
        this.userBoosterRepository = userBoosterRepository;
        this.eventEmitter = eventEmitter;
    }
    async execute(params) {
        const { userId, productId, telegramPaymentId, metadata } = params;
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.isBanned) {
            throw new common_1.BadRequestException('User is banned');
        }
        const product = await this.productRepository.findOne({
            where: { id: productId, isActive: true },
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        if (!product.isAvailable()) {
            throw new common_1.BadRequestException('Product is not available');
        }
        if (product.metadata?.purchaseLimit) {
            const userPurchaseCount = await this.purchaseRepository.count({
                where: { userId, productId, status: purchase_entity_1.PurchaseStatus.COMPLETED },
            });
            if (userPurchaseCount >= product.metadata.purchaseLimit) {
                throw new common_1.BadRequestException('Purchase limit reached for this product');
            }
        }
        await this.validateAndDeductCurrency(user, product);
        const purchase = this.purchaseRepository.create({
            userId,
            productId,
            status: purchase_entity_1.PurchaseStatus.COMPLETED,
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
        const rewardResult = await this.applyRewards(user, product, purchase);
        purchase.rewardApplied = true;
        await this.purchaseRepository.save(purchase);
        product.purchaseCount += 1;
        await this.productRepository.save(product);
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
    async validateAndDeductCurrency(user, product) {
        switch (product.currency) {
            case product_entity_1.ProductCurrency.GEMS:
                if (user.gems < product.price) {
                    throw new common_1.BadRequestException('Insufficient gems');
                }
                user.gems -= product.price;
                await this.userRepository.save(user);
                break;
            case product_entity_1.ProductCurrency.FOLLOWERS:
                if (user.followers < BigInt(Math.floor(product.price))) {
                    throw new common_1.BadRequestException('Insufficient followers');
                }
                user.followers -= BigInt(Math.floor(product.price));
                await this.userRepository.save(user);
                break;
            case product_entity_1.ProductCurrency.STARS:
                break;
            default:
                throw new common_1.BadRequestException('Unsupported currency');
        }
    }
    async applyRewards(user, product, purchase) {
        const result = {};
        const reward = product.reward;
        if (reward.gems) {
            user.gems += reward.gems;
            result.gems = reward.gems;
        }
        if (reward.followers) {
            const followersToAdd = BigInt(reward.followers);
            user.followers += followersToAdd;
            result.followers = followersToAdd;
        }
        if (reward.energy) {
            user.energy = Math.min(user.energy + reward.energy, user.maxEnergy);
            result.energy = reward.energy;
        }
        await this.userRepository.save(user);
        if (reward.boosterType && reward.boosterDurationHours) {
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + reward.boosterDurationHours);
            const existingBooster = await this.userBoosterRepository.findOne({
                where: {
                    userId: user.id,
                    boosterType: reward.boosterType,
                    isActive: true,
                },
            });
            if (existingBooster && !existingBooster.isExpired()) {
                existingBooster.expiresAt = new Date(existingBooster.expiresAt.getTime() +
                    reward.boosterDurationHours * 60 * 60 * 1000);
                await this.userBoosterRepository.save(existingBooster);
                result.booster = {
                    type: reward.boosterType,
                    expiresAt: existingBooster.expiresAt,
                    multiplier: existingBooster.multiplier,
                };
            }
            else {
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
    async getPurchaseHistory(userId, limit = 50) {
        return this.purchaseRepository.find({
            where: { userId },
            relations: ['product'],
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
    async getUserBoosters(userId) {
        const boosters = await this.userBoosterRepository.find({
            where: { userId, isActive: true },
            order: { expiresAt: 'ASC' },
        });
        return boosters.filter((b) => !b.isExpired());
    }
    async getActiveBoosterMultiplier(userId, boosterType) {
        const booster = await this.userBoosterRepository.findOne({
            where: { userId, boosterType, isActive: true },
        });
        if (!booster || booster.isExpired()) {
            return 1;
        }
        return booster.multiplier;
    }
};
exports.ProcessPurchaseUseCase = ProcessPurchaseUseCase;
exports.ProcessPurchaseUseCase = ProcessPurchaseUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(1, (0, typeorm_1.InjectRepository)(purchase_entity_1.Purchase)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(3, (0, typeorm_1.InjectRepository)(user_booster_entity_1.UserBooster)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        event_emitter_1.EventEmitter2])
], ProcessPurchaseUseCase);
//# sourceMappingURL=process-purchase.use-case.js.map