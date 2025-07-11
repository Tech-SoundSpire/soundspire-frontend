import { Model, DataTypes } from 'sequelize';
import sequelize from '../lib/sequelize';
import type { Models } from './index';

class Like extends Model {
  static associate(models: Models) {
    Like.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });

    Like.belongsTo(models.Post, {
      foreignKey: 'post_id',
      as: 'post',
    });

    Like.belongsTo(models.Comment, {
      foreignKey: 'comment_id',
      as: 'comment',
    });
  }
}

Like.init(
  {
    like_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    post_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    comment_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    review_id : {
      type: DataTypes.UUID,
      allowNull: true,
    },
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
    indexes: [
      {
        name: 'idx_likes_post_id',
        fields: ['post_id'],
      },
      {
        name: 'idx_likes_comment_id',
        fields: ['comment_id'],
      },
      {
        name: 'idx_likes_user_id',
        fields: ['user_id'],
      },
      {
        name: 'unique_user_like',
        unique: true,
        fields: ['user_id', 'post_id', 'comment_id'],
      },
    ],
    validate: {
      atleastOne() {
        const hasPost = !!this.post_id;
        const hasComment = !!this.comment_id;
        const hasReview = !!this.review_id;
        const onlyOneTrue = [hasPost, hasComment, hasReview].filter(Boolean).length === 1;

        if (!onlyOneTrue) {
          throw new Error('Exactly one of post_id or comment_id or review_id must be set');
        }
      },
    },
  }
);

export default Like;
