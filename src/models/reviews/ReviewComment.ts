import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../lib/dbConfig";
import { v4 as uuidv4 } from "uuid";

interface ReviewCommentAttributes {
  comment_id: string;
  user_id: string;
  review_id: string;
  comment_text: string;
  created_at: Date;
}

type ReviewCommentCreationAttributes = Optional<ReviewCommentAttributes, "comment_id" | "created_at">;

class ReviewComment extends Model<ReviewCommentAttributes, ReviewCommentCreationAttributes> implements ReviewCommentAttributes {
  declare comment_id: string;
  declare user_id: string;
  declare review_id: string;
  declare comment_text: string;
  declare created_at: Date;
}

ReviewComment.init(
  {
    comment_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: () => uuidv4(),
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "users", key: "user_id" },
      onDelete: "CASCADE",
    },
    review_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "song_reviews", key: "review_id" },
      onDelete: "CASCADE",
    },
    comment_text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "ReviewComment",
    tableName: "review_comments",
    timestamps: false,
    indexes: [
      { fields: ["review_id"] },
    ],
  }
);

export default ReviewComment;
