import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

config();

const isProduction = process.env.NODE_ENV === 'production';
const useSSL = process.env.DB_SSL === 'true';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5434', 10),
  username: process.env.POSTGRES_USER || 'boyzueira',
  password: process.env.POSTGRES_PASSWORD || 'boyzueira',
  database: process.env.POSTGRES_DB || 'boyzueira_db',
  entities: isProduction
    ? ['dist/domain/entities/*.entity.js']
    : ['src/domain/entities/*.entity.ts'],
  migrations: isProduction
    ? ['dist/infrastructure/database/migrations/*.js']
    : ['src/infrastructure/database/migrations/*.ts'],
  // Set DB_SYNCHRONIZE=true on a fresh DB to let TypeORM create the schema
  // from entities, then flip back to false. Off by default.
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  logging: process.env.NODE_ENV === 'development',
  ssl: useSSL ? { rejectUnauthorized: false } : false,
};

const AppDataSource = new DataSource(dataSourceOptions);

export default AppDataSource;
