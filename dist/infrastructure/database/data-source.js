"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataSourceOptions = void 0;
const typeorm_1 = require("typeorm");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
exports.dataSourceOptions = {
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
const AppDataSource = new typeorm_1.DataSource(exports.dataSourceOptions);
exports.default = AppDataSource;
//# sourceMappingURL=data-source.js.map