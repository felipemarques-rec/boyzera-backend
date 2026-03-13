import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { seedLevels } from './seeds/levels.seed';
import { seedHypeConfig } from './seeds/hype-config.seed';
import { seedDailyAwardConfig } from './seeds/daily-award-config.seed';
import { seedGameItems } from './seeds/game-items.seed';

@Injectable()
export class DatabaseSeederService implements OnModuleInit {
  constructor(private dataSource: DataSource) {}

  async onModuleInit() {
    try {
      console.log('Running database seeds...');
      await seedLevels(this.dataSource);
      await seedHypeConfig(this.dataSource);
      await seedDailyAwardConfig(this.dataSource);
      await seedGameItems(this.dataSource);
      console.log('Database seeds completed!');
    } catch (error) {
      console.error('Error running database seeds:', error);
    }
  }
}
