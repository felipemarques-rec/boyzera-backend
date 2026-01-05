"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockchainModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const wallet_connection_entity_1 = require("../../domain/entities/wallet-connection.entity");
const token_distribution_entity_1 = require("../../domain/entities/token-distribution.entity");
const user_entity_1 = require("../../domain/entities/user.entity");
const ton_connect_service_1 = require("./ton-connect.service");
const token_distribution_service_1 = require("./token-distribution.service");
const connect_wallet_use_case_1 = require("../../use-cases/blockchain/connect-wallet.use-case");
const claim_tokens_use_case_1 = require("../../use-cases/blockchain/claim-tokens.use-case");
const blockchain_controller_1 = require("../../presentation/controllers/blockchain.controller");
let BlockchainModule = class BlockchainModule {
};
exports.BlockchainModule = BlockchainModule;
exports.BlockchainModule = BlockchainModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([wallet_connection_entity_1.WalletConnection, token_distribution_entity_1.TokenDistribution, user_entity_1.User]),
        ],
        controllers: [blockchain_controller_1.BlockchainController],
        providers: [
            ton_connect_service_1.TonConnectService,
            token_distribution_service_1.TokenDistributionService,
            connect_wallet_use_case_1.ConnectWalletUseCase,
            claim_tokens_use_case_1.ClaimTokensUseCase,
        ],
        exports: [
            ton_connect_service_1.TonConnectService,
            token_distribution_service_1.TokenDistributionService,
            connect_wallet_use_case_1.ConnectWalletUseCase,
            claim_tokens_use_case_1.ClaimTokensUseCase,
        ],
    })
], BlockchainModule);
//# sourceMappingURL=blockchain.module.js.map