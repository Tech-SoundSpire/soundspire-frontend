import pg from 'pg';
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
  process.env.DB_NAME as string,
  process.env.DB_USERNAME as string,
  process.env.DB_PASSWORD!,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    dialect: (process.env.DB_DIALECT as any) || 'postgres',
    dialectModule: pg,
    logging: false,
  }
);

export default sequelize;