import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConnectWalletUseCase } from './connect-wallet.use-case';
import { TonConnectService } from '../../infrastructure/blockchain/ton-connect.service';
import {
  WalletConnection,
  WalletType,
  WalletStatus,
} from '../../domain/entities/wallet-connection.entity';
import { BadRequestException } from '@nestjs/common';

describe('ConnectWalletUseCase', () => {
  let useCase: ConnectWalletUseCase;
  let tonConnectService: jest.Mocked<TonConnectService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  const mockWalletConnection: Partial<WalletConnection> = {
    id: 'wallet-id',
    userId: 'user-id',
    walletAddress: 'EQAbc123...',
    walletType: WalletType.TONKEEPER,
    status: WalletStatus.CONNECTED,
    isPrimary: true,
    connectedAt: new Date(),
    getShortAddress: jest.fn().mockReturnValue('EQAbc...123'),
  };

  const mockProof = {
    timestamp: Math.floor(Date.now() / 1000),
    domain: { lengthBytes: 15, value: 'boyzueira.com' },
    signature: 'mock-signature',
    payload: 'mock-payload',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConnectWalletUseCase,
        {
          provide: TonConnectService,
          useValue: {
            generatePayload: jest.fn(),
            connectWallet: jest.fn(),
            disconnectWallet: jest.fn(),
            getUserWallets: jest.fn(),
            getPrimaryWallet: jest.fn(),
            setPrimaryWallet: jest.fn(),
            getExplorerUrl: jest.fn(),
            getNetwork: jest.fn(),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<ConnectWalletUseCase>(ConnectWalletUseCase);
    tonConnectService = module.get(TonConnectService);
    eventEmitter = module.get(EventEmitter2);
  });

  describe('generatePayload', () => {
    it('should generate a payload with expiration', async () => {
      tonConnectService.generatePayload.mockResolvedValue('mock-payload');

      const result = await useCase.generatePayload();

      expect(result.payload).toBe('mock-payload');
      expect(result.expiresAt).toBeGreaterThan(Date.now());
    });
  });

  describe('execute', () => {
    it('should connect wallet successfully', async () => {
      tonConnectService.connectWallet.mockResolvedValue(
        mockWalletConnection as WalletConnection,
      );

      const result = await useCase.execute({
        userId: 'user-id',
        walletAddress: 'EQAbc123...',
        walletType: WalletType.TONKEEPER,
        proof: mockProof,
      });

      expect(result).toBeDefined();
      expect(result.walletAddress).toBe('EQAbc123...');
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'wallet.connected',
        expect.any(Object),
      );
    });

    it('should throw when wallet connection fails', async () => {
      tonConnectService.connectWallet.mockRejectedValue(
        new Error('Invalid wallet proof'),
      );

      await expect(
        useCase.execute({
          userId: 'user-id',
          walletAddress: 'EQAbc123...',
          walletType: WalletType.TONKEEPER,
          proof: mockProof,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('disconnect', () => {
    it('should disconnect wallet and emit event', async () => {
      await useCase.disconnect('user-id', 'EQAbc123...');

      expect(tonConnectService.disconnectWallet).toHaveBeenCalledWith(
        'user-id',
        'EQAbc123...',
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'wallet.disconnected',
        expect.any(Object),
      );
    });
  });

  describe('getUserWallets', () => {
    it('should return user wallets', async () => {
      tonConnectService.getUserWallets.mockResolvedValue([
        mockWalletConnection as WalletConnection,
      ]);

      const result = await useCase.getUserWallets('user-id');

      expect(result).toHaveLength(1);
    });
  });

  describe('getPrimaryWallet', () => {
    it('should return primary wallet', async () => {
      tonConnectService.getPrimaryWallet.mockResolvedValue(
        mockWalletConnection as WalletConnection,
      );

      const result = await useCase.getPrimaryWallet('user-id');

      expect(result).toBeDefined();
      expect(result?.isPrimary).toBe(true);
    });

    it('should return null when no primary wallet', async () => {
      tonConnectService.getPrimaryWallet.mockResolvedValue(null);

      const result = await useCase.getPrimaryWallet('user-id');

      expect(result).toBeNull();
    });
  });

  describe('getNetwork', () => {
    it('should return network from service', () => {
      tonConnectService.getNetwork.mockReturnValue('testnet');

      const result = useCase.getNetwork();

      expect(result).toBe('testnet');
    });
  });
});
