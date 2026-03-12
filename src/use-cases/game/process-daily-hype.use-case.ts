import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '../../domain/entities/user.entity';
import { HypeConfig } from '../../domain/entities/hype-config.entity';
import { HypeService, HypeCalculationResult } from '../../domain/services/hype.service';
import { Transaction, TransactionType, CurrencyType } from '../../domain/entities/transaction.entity';

@Injectable()
export class ProcessDailyHypeUseCase {
  private readonly logger = new Logger(ProcessDailyHypeUseCase.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(HypeConfig)
    private hypeConfigRepository: Repository<HypeConfig>,
    private hypeService: HypeService,
    private dataSource: DataSource,
  ) {}

  /**
   * Processa o hype diário para um usuário específico.
   * Chamado no login diário ou pelo cron job.
   */
  async execute(userId: string): Promise<HypeCalculationResult | null> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || user.isBanned) return null;

    const config = await this.getActiveConfig();
    if (!config) {
      this.logger.warn('No active HypeConfig found');
      return null;
    }

    // Verificar se já processou hoje
    if (this.alreadyProcessedToday(user)) {
      return null;
    }

    // Calcular dias sem login
    const daysMissed = this.calculateDaysMissed(user);
    const didLogin = true; // Se estamos executando no contexto do user, ele logou

    // Processar hype
    const result = this.hypeService.processDailyHype(user, config, didLogin, daysMissed);

    // Salvar com transaction para auditoria
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Atualizar user
      await queryRunner.manager.update(User, userId, {
        hype: result.newHype,
        dailyEngagement: 0, // Reset diário
        daysMissed: 0,
        lastHypeCalculation: new Date(),
      });

      // Criar audit trail
      const transaction = queryRunner.manager.create(Transaction, {
        userId,
        type: TransactionType.REWARD,
        currency: CurrencyType.FOLLOWERS, // Usando FOLLOWERS como proxy, hype não é currency
        amount: BigInt(0),
        metadata: {
          description: `hype_${result.type}`,
          hypeChange: result.deltaHype,
          previousHype: result.previousHype,
          newHype: result.newHype,
          engagement: user.dailyEngagement,
          loginStreak: user.loginStreak,
          daysMissed,
          configVersion: config.version,
          decayReason: result.decayReason,
        } as any,
      });
      await queryRunner.manager.save(transaction);

      await queryRunner.commitTransaction();

      this.logger.log(
        `Hype ${result.type} for user ${userId}: ${result.previousHype.toFixed(3)} → ${result.newHype.toFixed(3)} (Δ${result.deltaHype > 0 ? '+' : ''}${result.deltaHype.toFixed(4)})`,
      );

      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to process daily hype for user ${userId}`, error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Processa decay para usuários inativos (chamado pelo cron).
   */
  async processDecayForInactiveUsers(): Promise<number> {
    const config = await this.getActiveConfig();
    if (!config) return 0;

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Buscar users que não logaram hoje e têm hype > 0
    const inactiveUsers = await this.userRepository
      .createQueryBuilder('user')
      .where('user.hype > 0')
      .andWhere('user.isBanned = false')
      .andWhere(
        '(user.lastLoginAt IS NULL OR user.lastLoginAt < :oneDayAgo)',
        { oneDayAgo },
      )
      .andWhere(
        '(user.lastHypeCalculation IS NULL OR user.lastHypeCalculation < :oneDayAgo)',
        { oneDayAgo },
      )
      .getMany();

    let processedCount = 0;

    for (const user of inactiveUsers) {
      try {
        const daysMissed = this.calculateDaysMissed(user);
        const result = this.hypeService.calculateHypeDecay(user, config, daysMissed);

        await this.userRepository.update(user.id, {
          hype: result.newHype,
          daysMissed,
          lastHypeCalculation: new Date(),
        });

        processedCount++;
      } catch (error) {
        this.logger.error(`Failed to decay hype for user ${user.id}`, error);
      }
    }

    this.logger.log(`Processed hype decay for ${processedCount} inactive users`);
    return processedCount;
  }

  private async getActiveConfig(): Promise<HypeConfig | null> {
    return this.hypeConfigRepository.findOne({
      where: { isActive: true },
    });
  }

  private alreadyProcessedToday(user: User): boolean {
    if (!user.lastHypeCalculation) return false;

    const now = new Date();
    const lastCalc = new Date(user.lastHypeCalculation);

    return (
      lastCalc.getFullYear() === now.getFullYear() &&
      lastCalc.getMonth() === now.getMonth() &&
      lastCalc.getDate() === now.getDate()
    );
  }

  private calculateDaysMissed(user: User): number {
    if (!user.lastLoginAt) return 1;

    const now = new Date();
    const lastLogin = new Date(user.lastLoginAt);

    const diffMs = now.getTime() - lastLogin.getTime();
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

    return Math.max(0, diffDays - 1); // -1 porque o dia do login não conta como "missed"
  }
}
