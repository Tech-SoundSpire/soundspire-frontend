// This is used to sync the latest tables with the databases
import { sequelize } from "./dbConfig";
import "../models/User"; //Importing all the models

export async function initSchemas() {
  try {
    //Syncing the tables based on the models
    await sequelize.sync({ force: true });
    console.log("All models were synchronized successfully!");

  } catch (err) {
    console.error("Error Syncing schemas:", err);
  }
}
