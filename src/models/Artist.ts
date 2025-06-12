import { Model, DataTypes } from 'sequelize';
import sequelize from '../lib/sequelize';
import type { Models } from './index';

class Artist extends Model {
  static associate(models: Models) {
    Artist.hasMany(models.Post, { foreignKey: 'artist_id', as: 'posts' });
    Artist.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  }
}

Artist.init(
  {
    artist_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    artist_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    bio: {
      type: DataTypes.TEXT,
    },
    profile_picture_url: {
      type: DataTypes.TEXT,
    },
    cover_photo_url: {
      type: DataTypes.TEXT,
    },
    verification_status: {
      type: DataTypes.STRING(50),
      defaultValue: 'pending',
    },
    third_party_platform: {
      type: DataTypes.STRING(50),
    },
    third_party_id: {
      type: DataTypes.STRING(255),
    },
    featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    payout_method: {
      type: DataTypes.JSONB,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Artist',
    tableName: 'artists',
    timestamps: false,
    underscored: true,
  }
);

export default Artist;
