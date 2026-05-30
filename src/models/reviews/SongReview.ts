import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../lib/dbConfig";
import { v4 as uuidv4 } from "uuid";

interface SongReviewAttributes {
  review_id: string;
  user_id: string;
  spotify_track_id: string;
  rating: number | null;
  review_text: string;
  contains_spoilers: boolean;
  is_private: boolean;
  like_count: number;
  comment_count: number;
  created_at: Date;
  updated_at: Date;
}

type SongReviewCreationAttributes = Optional<SongReviewAttributes, "review_id" | "rating" | "contains_spoilers" | "is_private" | "like_count" | "comment_count" | "created_at" | "updated_at">;

class SongReview extends Model<SongReviewAttributes, SongReviewCreationAttributes> implements SongReviewAttributes {
  declare review_id: string;
  declare user_id: string;
  declare spotify_track_id: string;
  declare rating: number | null;
  declare review_text: string;
  declare contains_spoilers: boolean;
  declare is_private: boolean;
  declare like_count: number;
  declare comment_count: number;
  declare created_at: Date;
  declare updated_at: Date;
}

SongReview.init(
  {
    review_id: {
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
    spotify_track_id: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    rating: {
      type: DataTypes.DECIMAL(2, 1),
      validate: { min: 0.5, max: 5.0 },
    },
    review_text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    contains_spoilers: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_private: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    like_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    comment_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
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
    modelName: "SongReview",
    tableName: "song_reviews",
    timestamps: false,
    indexes: [
      { unique: true, fields: ["user_id", "spotify_track_id"] },
      { fields: ["spotify_track_id"] },
      { fields: ["user_id"] },
      { fields: ["like_count"] },
    ],
  }
);

export default SongReview;
