//Connecting database
import { Sequelize } from "sequelize";
import pg from 'pg';


let connected = false;//Check for connection

export const sequelize = new Sequelize(
  process.env.DB_NAME as string,
  process.env.DB_USER as string,
  process.env.DB_PASSWORD as string,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    dialectModule: pg,
    logging: false
  }
);

//Establising the connection with the database and as db in other country use try catch
export async function establishConnection() {
  if (connected) return;

  try {
    await sequelize.authenticate();
    // await initSchemas();
    console.log("Database connection established!");
    connected = true;
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}