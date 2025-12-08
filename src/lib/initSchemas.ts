// This is used to sync the latest tables with the databases
import { sequelize } from "./dbConfig";

// Import the models index - this will trigger defineAssociations()
import "../models/index"; // This imports models/index.ts

// Import individual models for syncing
import "../models/User"; 
import "../models/UserVerification"

let hasSynced = false;

export async function initSchemas() {
  try {
    // Only sync models once, not on every API request
    // Set SYNC_DB=true in .env.local if you need to sync schema changes
    const shouldSync = process.env.SYNC_DB === "true" && !hasSynced;
    
    if (shouldSync) {
      //Syncing the tables based on the models
      // await sequelize.sync({ force: true }); //Only if database change is needed during development mode
      await sequelize.sync();//After database is changed enable this
      console.log("All models were synchronized successfully!");
      hasSynced = true;
    }
    // Otherwise, just ensure connection is established (models are already defined)

  } catch (err) {
    console.error("Error Syncing schemas:", err);
  }
}
