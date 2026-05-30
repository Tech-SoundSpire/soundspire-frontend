import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../lib/dbConfig";
import { v4 as uuidv4 } from "uuid";

interface SongRatingAttributes {
  rating_id: string;
  user_id: string;
  spotify_track_id: string;
  rating: number;
  created_at: Date;
  updated_at: Date;
}

type SongRatingCreationAttributes = Optional<SongRatingAttributes, "rating_id" | "created_at" | "updated_at">;

class SongRating extends Model<SongRatingAttributes, SongRatingCreationAttributes> implements SongRatingAttributes {
  declare rating_id: string;
  declare user_id: string;
  declare spotify_track_id: string;
  declare rating: number;
  declare created_at: Date;
  declare updated_at: Date;
}

SongRating.init(
  {
    rating_id: {
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
      allowNull: false,
      validate: { min: 0.5, max: 5.0 },
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
    modelName: "SongRating",
    tableName: "song_ratings",
    timestamps: false,
    indexes: [
      { unique: true, fields: ["user_id", "spotify_track_id"] },
      { fields: ["spotify_track_id"] },
      { fields: ["user_id"] },
    ],
  }
);

export default SongRating;
