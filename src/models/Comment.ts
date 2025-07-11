import { Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelize from '../lib/sequelize';
import type { Models } from './index';

class Comment extends Model<
  InferAttributes<Comment>,
  InferCreationAttributes<Comment>
> {
  declare comment_id: CreationOptional<string>;
  declare post_id: string | null;
  declare parent_comment_id: string | null;
  declare review_id: string | null;
  declare user_id: string;
  declare content: string;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
  declare deleted_at: Date | null;

  static associate(models: Models) {
    Comment.belongsTo(models.Post, {
      foreignKey: 'post_id',
      as: 'post',
    });

    Comment.hasMany(models.Comment, {
      foreignKey: 'parent_comment_id',
      as: 'replies',
    });

    Comment.hasMany(models.Like, {
      foreignKey: 'comment_id',
      as: 'likes',
    });

    Comment.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  }
}

Comment.init(
  {
    comment_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    post_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    parent_comment_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    review_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
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
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
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