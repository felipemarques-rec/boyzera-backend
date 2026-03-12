import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ProcessDailyHypeUseCase } from '../../use-cases/game/process-daily-hype.use-case';

@Injectable()
export class HypeDecayCronService {
  private readonly logger = new Logger(HypeDecayCronService.name);

  constructor(
    private processDailyHypeUseCase: ProcessDailyHypeUseCase,
  ) {}

  /**
   * Executa todos os dias à meia-noite (00:00 UTC).
   * Processa decay de hype para usuários que não logaram.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleHypeDecay(): Promise<void> {
    this.logger.log('Starting daily hype decay cron job...');

    try {
      const count = await this.processDailyHypeUseCase.processDecayForInactiveUsers();
      this.logger.log(`Hype decay cron completed. Processed ${count} users.`);
    } catch (error) {
      this.logger.error('Hype decay cron failed', error);
    }
  }
}
