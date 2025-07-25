import sequelize from '@/lib/sequelize';

import Post from './Post';
import Comment from './Comment';
import Like from './Like';
import Community from './Community';
import CommunitySubscription from './CommunitySubscription';
import Artist from './Artist';
import {User} from './User';

import { defineAssociations } from './associations';

// Define models map
const models = {
  Post,
  Comment,
  Like,
  Community,
  CommunitySubscription,
  Artist,
  User,
};

// Define a type for the models map
export type Models = typeof models;

// Run associations if using associate pattern
Object.values(models).forEach((model) => {
  if ('associate' in model && typeof model.associate === 'function') {
    model.associate(models);
  }
});

// Alternatively, run centralized association setup
defineAssociations();


export async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established!');

    // Sync all models (adjust alter: true if needed during dev)
    await Promise.all(
      Object.values(models).map((model) => model.sync({ alter: false }))
    );

    console.log('✅ All models were synchronized successfully!');
  } catch (error: unknown) {
    console.error('❌ Database initialization failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    throw new Error(errorMessage);
  }
}

export { sequelize };
export default models;
export { Post, Comment, Like, Community, CommunitySubscription, Artist, User };