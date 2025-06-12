import sequelize from '../lib/sequelize';
import Post from './Post';
import Comment from './Comment';
import Like from './Like';
import Artist from './Artist';
import User from './User';

const models = {
  Post: Post,
  Comment: Comment,
  Like: Like,
  Artist: Artist,
  User: User
};

// Define a type for the models map
export type Models = typeof models;

// Call associate on each model
Object.values(models).forEach((model) => {
  if ('associate' in model && typeof model.associate === 'function') {
    model.associate(models);
  }
});

export { sequelize };
export default models;
