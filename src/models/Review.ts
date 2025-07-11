import { DataTypes, Model } from 'sequelize';
import sequelize from '../lib/sequelize';

class Review extends Model {}

Review.init(
  {
    review_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    content_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    content_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    artist_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    artist_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    content_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    text_content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    rating: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    image_urls: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Review',
    tableName: 'reviews',
    timestamps: false,
    underscored: true,
  }
);

export default Review; 