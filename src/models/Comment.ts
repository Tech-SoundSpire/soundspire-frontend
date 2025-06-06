import { DataTypes, Model } from 'sequelize';
import sequelize from '../lib/sequelize';

class Comment extends Model {}

Comment.init(
  {
    comment_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    post_id: DataTypes.UUID,
    parent_comment_id: DataTypes.UUID,
    review_id: DataTypes.UUID,
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    deleted_at: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'Comment',
    tableName: 'comments',
    timestamps: false,
    underscored: true,
  }
);

export default Comment; 