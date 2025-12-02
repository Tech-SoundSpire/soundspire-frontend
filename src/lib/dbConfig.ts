// src/lib/dbConfig.ts
import sequelize from "./sequelize";

let cachedConnection: any = null;

// Create the establishConnection function that dbConnection.ts uses
export const establishConnection = async () => {
  try {
    if (cachedConnection) {
      return cachedConnection;
    }

    await sequelize.authenticate();
    console.log("✅ Database connection established successfully.");
    cachedConnection = sequelize;
    return sequelize;
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
    throw error;
  }
};

// Export sequelize as well for backward compatibility
export { sequelize };