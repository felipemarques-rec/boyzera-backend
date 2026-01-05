import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConnectWalletUseCase } from '../../use-cases/blockchain/connect-wallet.use-case';
import { ClaimTokensUseCase } from '../../use-cases/blockchain/claim-tokens.use-case';
import { WalletType } from '../../domain/entities/wallet-connection.entity';

class ConnectWalletDto {
  walletAddress: string;
  walletType: WalletType;
  proof: {
    timestamp: number;
    domain: {
      lengthBytes: number;
      value: string;
    };
    signature: string;
    payload: string;
  };
  walletInfo?: {
    address: string;
    publicKey: string;
    walletVersion?: string;
    chainId?: number;
  };
}

class ExchangeGemsDto {
  gems: number;
}

@Controller('blockchain')
@UseGuards(AuthGuard('jwt'))
export class BlockchainController {
  constructor(
    private connectWalletUseCase: ConnectWalletUseCase,
    private claimTokensUseCase: ClaimTokensUseCase,
  ) {}

  @Get('wallet/payload')
  async getConnectPayload() {
    const result = await this.connectWalletUseCase.generatePayload();

    return {
      success: true,
      data: result,
    };
  }

  @Post('wallet/connect')
  async connectWallet(@Request() req: any, @Body() dto: ConnectWalletDto) {
    try {
      const connection = await this.connectWalletUseCase.execute({
        userId: req.user.id,
        walletAddress: dto.walletAddress,
        walletType: dto.walletType,
        proof: dto.proof,
        walletInfo: dto.walletInfo,
      });

      return {
        success: true,
        data: {
          id: connection.id,
          walletAddress: connection.walletAddress,
          shortAddress: connection.getShortAddress(),
          walletType: connection.walletType,
          status: connection.status,
          isPrimary: connection.isPrimary,
          connectedAt: connection.connectedAt,
          explorerUrl: this.connectWalletUseCase.getExplorerUrl(
            connection.walletAddress,
          ),
        },
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to connect wallet',
      };
    }
  }

  @Post('wallet/disconnect/:address')
  async disconnectWallet(
    @Request() req: any,
    @Param('address') address: string,
  ) {
    await this.connectWalletUseCase.disconnect(req.user.id, address);

    return {
      success: true,
      message: 'Wallet disconnected',
    };
  }

  @Get('wallets')
  async getUserWallets(@Request() req: any) {
    const wallets = await this.connectWalletUseCase.getUserWallets(req.user.id);

    return {
      success: true,
      data: wallets.map((w) => ({
        id: w.id,
        walletAddress: w.walletAddress,
        shortAddress: w.getShortAddress(),
        walletType: w.walletType,
        status: w.status,
        isPrimary: w.isPrimary,
        connectedAt: w.connectedAt,
        explorerUrl: this.connectWalletUseCase.getExplorerUrl(w.walletAddress),
      })),
    };
  }

  @Post('wallet/primary/:address')
  async setPrimaryWallet(
    @Request() req: any,
    @Param('address') address: string,
  ) {
    await this.connectWalletUseCase.setPrimaryWallet(req.user.id, address);

    return {
      success: true,
      message: 'Primary wallet updated',
    };
  }

  @Get('tokens/balance')
  async getTokenBalance(@Request() req: any) {
    const balance = await this.claimTokensUseCase.getTokenBalance(req.user.id);

    return {
      success: true,
      data: balance,
    };
  }

  @Post('tokens/claim')
  async claimPendingTokens(@Request() req: any) {
    try {
      const result = await this.claimTokensUseCase.claimPendingTokens(
        req.user.id,
      );

      return {
        success: true,
        data: {
          claimed: result.claimed,
          failed: result.failed,
          distributions: result.distributions.map((d) => ({
            id: d.id,
            type: d.type,
            amount: d.amount,
            status: d.status,
            transactionHash: d.transactionHash,
            explorerUrl: d.getExplorerUrl(),
          })),
        },
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to claim tokens',
      };
    }
  }

  @Post('tokens/exchange')
  async exchangeGemsForTokens(
    @Request() req: any,
    @Body() dto: ExchangeGemsDto,
  ) {
    try {
      const distribution = await this.claimTokensUseCase.exchangeGemsForTokens(
        req.user.id,
        dto.gems,
      );

      return {
        success: true,
        data: {
          distributionId: distribution.id,
          gemsExchanged: dto.gems,
          tokensReceived: distribution.amount,
          status: distribution.status,
        },
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to exchange gems',
      };
    }
  }

  @Get('tokens/history')
  async getDistributionHistory(
    @Request() req: any,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    const distributions = await this.claimTokensUseCase.getDistributionHistory(
      req.user.id,
      Math.min(limit, 100),
    );

    return {
      success: true,
      data: distributions.map((d) => ({
        id: d.id,
        type: d.type,
        amount: d.amount,
        status: d.status,
        walletAddress: d.walletAddress,
        transactionHash: d.transactionHash,
        explorerUrl: d.getExplorerUrl(),
        metadata: d.metadata,
        createdAt: d.createdAt,
        processedAt: d.processedAt,
      })),
    };
  }

  @Get('tokens/stats')
  async getDistributionStats(@Request() req: any) {
    const stats = await this.claimTokensUseCase.getDistributionStats(
      req.user.id,
    );

    return {
      success: true,
      data: stats,
    };
  }

  @Get('info')
  async getBlockchainInfo() {
    return {
      success: true,
      data: {
        enabled: this.claimTokensUseCase.isBlockchainEnabled(),
        network: this.connectWalletUseCase.getNetwork(),
        tokenContract: this.claimTokensUseCase.getTokenContractAddress(),
        supportedWallets: Object.values(WalletType),
      },
    };
  }
}
