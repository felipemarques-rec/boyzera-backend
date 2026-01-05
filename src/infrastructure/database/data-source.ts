import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5434', 10),
  username: process.env.POSTGRES_USER || 'boyzueira',
  password: process.env.POSTGRES_PASSWORD || 'boyzueira',
  database: process.env.POSTGRES_DB || 'boyzueira_db',
  entities: ['src/domain/entities/*.entity.ts'],
  migrations: ['src/infrastructure/database/migrations/*.ts'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
};

const AppDataSource = new DataSource(dataSourceOptions);

export default AppDataSource;
