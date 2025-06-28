// src/lib/sequelize.ts

import { Sequelize } from 'sequelize';
import pg from 'pg';

// Validate that the DATABASE_URL is defined
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('❌ DATABASE_URL environment variable is not defined.');
}

// Initialize Sequelize with proper config
const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  dialectModule: pg, // Explicitly specify the pg module to avoid dynamic imports
  logging: console.log, // You can turn this off in production
});

export default sequelize;
