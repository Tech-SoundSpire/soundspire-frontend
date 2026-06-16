import { Model, DataTypes, Sequelize, Optional } from "sequelize";
import { sequelize } from "../lib/dbConfig";

// Caches the resolution from a Spotify artist ID -> SoundCharts artist UUID.
// Resolving requires SoundCharts name-search + identifier lookups, so we persist the
// result to avoid repeating those calls for the same artist. soundcharts_uuid may be
// null when no SoundCharts match exists (we still cache the negative result).
export interface SpotifySoundchartsMapAttributes {
  spotify_id: string;
  soundcharts_uuid: string | null;
  artist_name: string | null;
  resolved_at?: Date;
}

type CreationAttributes = Optional<SpotifySoundchartsMapAttributes, "resolved_at" | "artist_name" | "soundcharts_uuid">;

export class SpotifySoundchartsMap
  extends Model<SpotifySoundchartsMapAttributes, CreationAttributes>
  implements SpotifySoundchartsMapAttributes
{
  declare spotify_id: string;
  declare soundcharts_uuid: string | null;
  declare artist_name: string | null;
  declare resolved_at?: Date;
}

SpotifySoundchartsMap.init(
  {
    spotify_id: {
      type: DataTypes.STRING(255),
      primaryKey: true,
    },
    soundcharts_uuid: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    artist_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    resolved_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  },
  {
    sequelize,
    tableName: "spotify_soundcharts_map",
    timestamps: false,
  }
);

export default SpotifySoundchartsMap;
