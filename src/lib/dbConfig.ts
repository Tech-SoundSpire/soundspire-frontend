// src/lib/dbConfig.ts
import sequelize from './sequelize';

// Create the establishConnection function that your temp.ts is looking for
export const establishConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    return sequelize;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    throw error;
  }
};

// Export sequelize as well for backward compatibility
export { sequelize };