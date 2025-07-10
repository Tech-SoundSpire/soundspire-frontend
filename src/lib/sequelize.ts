import { Sequelize } from 'sequelize';
import pg from 'pg';

// Get individual database config from environment variables
const dbConfig = {
  user: process.env.DB_USER || process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '5432'),
  dialect: process.env.DB_DIALECT || 'postgres',
};

// Validate required environment variables
if (!dbConfig.user || !dbConfig.password || !dbConfig.host || !dbConfig.database) {
  throw new Error('❌ Database environment variables are not properly defined.');
}

// Initialize Sequelize
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.user,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect as 'postgres',
    dialectModule: pg,
    logging: process.env.NODE_ENV === 'production' ? false : console.log,
  }
);

export default sequelize;