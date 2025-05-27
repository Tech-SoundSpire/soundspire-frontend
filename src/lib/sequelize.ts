import { Sequelize } from 'sequelize';
import pg from 'pg'; // Explicitly import pg

const sequelize = new Sequelize(process.env.DATABASE_URL!, {
  dialect: 'postgres',
  dialectModule: pg, // Specify pg to avoid dynamic imports
  logging: console.log, // Keep for debugging
});

export default sequelize;