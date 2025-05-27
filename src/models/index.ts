import sequelize from '@/lib/sequelize';
     import User from './User';
     import Community from './Community';
     import Artist from './Artist';
     import CommunitySubscription from './CommunitySubscription';
     import { defineAssociations } from './associations';

     // Define associations before syncing
     defineAssociations();

     export async function initializeDatabase() {
       try {
         await sequelize.authenticate();
         console.log('Database connection established');
         await User.sync({ alter: false });
         await Artist.sync({ alter: false });
         await Community.sync({ alter: false });
         await CommunitySubscription.sync({ alter: false });
         console.log('Models synchronized');
       } catch (error: unknown) {
         console.error('Database initialization failed:', error);
         const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
         throw new Error(errorMessage);
       }
     }

     // Export models
     export { User, Community, Artist, CommunitySubscription };