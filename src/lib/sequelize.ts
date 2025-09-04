import pg from "pg";
import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  process.env.DB_NAME as string,
  process.env.DB_USER as string,
  process.env.DB_PASSWORD!,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    dialect: "postgres",
    dialectModule: pg,
    logging: false,
    pool: {
      max: 10, // Reduce max connections
      min: 0, // Start with 0 connections
      acquire: 30000, // Increase timeout to 30 seconds
      idle: 10000, // Release connections after 10 seconds of inactivity
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
);

export default sequelize;
