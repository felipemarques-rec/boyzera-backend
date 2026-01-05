import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletConnection } from '../../domain/entities/wallet-connection.entity';
import { TokenDistribution } from '../../domain/entities/token-distribution.entity';
import { User } from '../../domain/entities/user.entity';
import { TonConnectService } from './ton-connect.service';
import { TokenDistributionService } from './token-distribution.service';
import { ConnectWalletUseCase } from '../../use-cases/blockchain/connect-wallet.use-case';
import { ClaimTokensUseCase } from '../../use-cases/blockchain/claim-tokens.use-case';
import { BlockchainController } from '../../presentation/controllers/blockchain.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([WalletConnection, TokenDistribution, User]),
  ],
  controllers: [BlockchainController],
  providers: [
    TonConnectService,
    TokenDistributionService,
    ConnectWalletUseCase,
    ClaimTokensUseCase,
  ],
  exports: [
    TonConnectService,
    TokenDistributionService,
    ConnectWalletUseCase,
    ClaimTokensUseCase,
  ],
})
export class BlockchainModule {}
