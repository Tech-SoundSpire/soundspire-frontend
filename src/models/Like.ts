import { DataTypes, Model } from 'sequelize';
import sequelize from '../lib/sequelize';

class Like extends Model {}

Like.init(
  {
    like_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    post_id: DataTypes.UUID,
    comment_id: DataTypes.UUID,
    review_id: DataTypes.UUID,
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Like',
    tableName: 'likes',
    timestamps: false,
    underscored: true,
  }
);

export default Like; 