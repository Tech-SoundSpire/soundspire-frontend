import { Model, DataTypes } from 'sequelize';
import sequelize from '../lib/sequelize';
import type { Models } from './index';


class Post extends Model {
  static associate(models : Models) {
    Post.belongsTo(models.Artist, { foreignKey: 'artist_id', as: 'artist' });
    Post.hasMany(models.Comment, { foreignKey: 'post_id', as: 'comments' });
    Post.hasMany(models.Like, { foreignKey: 'post_id', as: 'likes' });
  }
}

Post.init(
  {
    post_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    artist_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    content_text: DataTypes.TEXT,
    media_type: DataTypes.STRING(50),
    media_urls: DataTypes.ARRAY(DataTypes.TEXT),
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    deleted_at: DataTypes.DATE
  },
  {
    sequelize,
    modelName: 'Post',
    tableName: 'posts',
    timestamps: false,
    underscored: true
  }
);

export default Post;
