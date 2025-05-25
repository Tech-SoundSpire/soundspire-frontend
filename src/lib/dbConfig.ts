//Connecting database
import { Sequelize } from "sequelize";
import { NextResponse } from "next/server";

import pg from 'pg';
import  dotenv  from 'dotenv';
dotenv.config();

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
  try {
    await sequelize.authenticate();
    console.log("Database connection established!");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}