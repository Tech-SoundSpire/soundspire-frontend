import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../lib/dbConfig";

interface SongAggregateAttributes {
  spotify_track_id: string;
  avg_rating: number | null;
  rating_count: number;
  review_count: number;
  like_count: number;
  log_count: number;
  rating_distribution: object | null;
  last_updated: Date;
}

class SongAggregate extends Model<SongAggregateAttributes> implements SongAggregateAttributes {
  declare spotify_track_id: string;
  declare avg_rating: number | null;
  declare rating_count: number;
  declare review_count: number;
  declare like_count: number;
  declare log_count: number;
  declare rating_distribution: object | null;
  declare last_updated: Date;
}

SongAggregate.init(
  {
    spotify_track_id: {
      type: DataTypes.STRING(64),
      primaryKey: true,
    },
    avg_rating: {
      type: DataTypes.DECIMAL(3, 2),
    },
    rating_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    review_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    like_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    log_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    rating_distribution: {
      type: DataTypes.JSONB,
    },
    last_updated: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "SongAggregate",
    tableName: "song_aggregate",
    timestamps: false,
    indexes: [
      { fields: ["avg_rating"] },
      { fields: ["review_count"] },
    ],
  }
);

export default SongAggregate;
