// This is used to sync the latest tables with the databases
import { sequelize } from "./dbConfig";

// Import the models index - this will trigger defineAssociations()
import "../models/index"; // This imports models/index.ts

// Import individual models for syncing
import "../models/User"; 
import "../models/UserVerification"

export async function initSchemas() {
  try {
    //Syncing the tables based on the models
    // await sequelize.sync({ force: true }); //Only if database change is needed during development mode
    await sequelize.sync();//After database is changed enable this
    console.log("All models were synchronized successfully!");

  } catch (err) {
    console.error("Error Syncing schemas:", err);
  }
}
