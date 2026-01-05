"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const product_entity_1 = require("../../domain/entities/product.entity");
const purchase_entity_1 = require("../../domain/entities/purchase.entity");
const user_entity_1 = require("../../domain/entities/user.entity");
const user_booster_entity_1 = require("../../domain/entities/user-booster.entity");
const get_products_use_case_1 = require("../../use-cases/shop/get-products.use-case");
const process_purchase_use_case_1 = require("../../use-cases/shop/process-purchase.use-case");
const shop_controller_1 = require("../../presentation/controllers/shop.controller");
let ShopModule = class ShopModule {
};
exports.ShopModule = ShopModule;
exports.ShopModule = ShopModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([product_entity_1.Product, purchase_entity_1.Purchase, user_entity_1.User, user_booster_entity_1.UserBooster])],
        controllers: [shop_controller_1.ShopController],
        providers: [get_products_use_case_1.GetProductsUseCase, process_purchase_use_case_1.ProcessPurchaseUseCase],
        exports: [get_products_use_case_1.GetProductsUseCase, process_purchase_use_case_1.ProcessPurchaseUseCase],
    })
], ShopModule);
//# sourceMappingURL=shop.module.js.map