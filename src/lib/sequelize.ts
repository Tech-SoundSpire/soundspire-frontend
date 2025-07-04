// src/lib/sequelize.ts

import { Sequelize } from 'sequelize';
import pg from 'pg';

// Get individual database config from environment variables
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '5432'),
};

// Validate required environment variables
if (!dbConfig.user || !dbConfig.password || !dbConfig.host || !dbConfig.database) {
  throw new Error('❌ Database environment variables are not properly defined.');
}

// Initialize Sequelize with proper config
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.user,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: 'postgres',
    dialectModule: pg,
    logging: console.log, // Set to false in production
  }
);

export default sequelize;