// This is used to sync the latest tables with the databases
import { sequelize } from "./db";
import "../models/User"; //Importing all the models

export async function initSchemas() {
  try{
    await sequelize.authenticate();
    console.log("DB connection authenticated");

    //Syncing the tables based on the models
    await sequelize.sync({alter: true});
    console.log("All models were synchronized successfully!");
  }catch(err){
    console.error("Error Syncing schemas:", err);
  }
}
