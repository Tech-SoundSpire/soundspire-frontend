import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../lib/dbConfig";

interface SongCacheAttributes {
  spotify_track_id: string;
  track_name: string;
  artist_name: string;
  artist_id: string;
  artists_json: { id: string; name: string }[] | null;
  album_name: string | null;
  album_id: string | null;
  album_art_url: string | null;
  duration_ms: number | null;
  isrc: string | null;
  explicit: boolean;
  release_date: string | null;
  spotify_url: string | null;
  credits_json: object | null;
  metadata_cached_at: Date;
  credits_cached_at: Date | null;
}

class SongCache extends Model<SongCacheAttributes> implements SongCacheAttributes {
  declare spotify_track_id: string;
  declare track_name: string;
  declare artist_name: string;
  declare artist_id: string;
  declare artists_json: { id: string; name: string }[] | null;
  declare album_name: string | null;
  declare album_id: string | null;
  declare album_art_url: string | null;
  declare duration_ms: number | null;
  declare isrc: string | null;
  declare explicit: boolean;
  declare release_date: string | null;
  declare spotify_url: string | null;
  declare credits_json: object | null;
  declare metadata_cached_at: Date;
  declare credits_cached_at: Date | null;
}

SongCache.init(
  {
    spotify_track_id: {
      type: DataTypes.STRING(64),
      primaryKey: true,
    },
    track_name: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    artist_name: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    artist_id: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    artists_json: {
      type: DataTypes.JSONB,
    },
    album_name: {
      type: DataTypes.STRING(500),
    },
    album_id: {
      type: DataTypes.STRING(64),
    },
    album_art_url: {
      type: DataTypes.TEXT,
    },
    duration_ms: {
      type: DataTypes.INTEGER,
    },
    isrc: {
      type: DataTypes.STRING(20),
    },
    explicit: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    release_date: {
      type: DataTypes.STRING(20),
    },
    spotify_url: {
      type: DataTypes.TEXT,
    },
    credits_json: {
      type: DataTypes.JSONB,
    },
    metadata_cached_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    credits_cached_at: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: "SongCache",
    tableName: "song_cache",
    timestamps: false,
  }
);

export default SongCache;
