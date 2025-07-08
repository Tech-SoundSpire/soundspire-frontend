import sequelize from '@/lib/sequelize';
import Community from './Community';
import Artist from './Artist';
import User from './User';
import CommunitySubscription from './CommunitySubscription';
import { defineAssociations } from './associations';

// ✅ Define all associations immediately
defineAssociations();

export async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established!');

    await User.sync({ alter: false });
    await Artist.sync({ alter: false });
    await Community.sync({ alter: false });
    await CommunitySubscription.sync({ alter: false });

    console.log('✅ All models were synchronized successfully!');
  } catch (error: unknown) {
    console.error('❌ Database initialization failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    throw new Error(errorMessage);
  }
}

export { User, Community, Artist, CommunitySubscription };
