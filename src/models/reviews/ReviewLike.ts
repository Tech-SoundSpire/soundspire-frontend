import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../lib/dbConfig";
import { v4 as uuidv4 } from "uuid";

interface ReviewLikeAttributes {
  like_id: string;
  user_id: string;
  review_id: string;
  created_at: Date;
}

type ReviewLikeCreationAttributes = Optional<ReviewLikeAttributes, "like_id" | "created_at">;

class ReviewLike extends Model<ReviewLikeAttributes, ReviewLikeCreationAttributes> implements ReviewLikeAttributes {
  declare like_id: string;
  declare user_id: string;
  declare review_id: string;
  declare created_at: Date;
}

ReviewLike.init(
  {
    like_id: {
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
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "ReviewLike",
    tableName: "review_likes",
    timestamps: false,
    indexes: [
      { unique: true, fields: ["user_id", "review_id"] },
    ],
  }
);

export default ReviewLike;
