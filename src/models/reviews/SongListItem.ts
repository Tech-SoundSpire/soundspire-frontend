import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../lib/dbConfig";
import { v4 as uuidv4 } from "uuid";

interface SongListItemAttributes {
  item_id: string;
  list_id: string;
  spotify_track_id: string;
  position: number | null;
  notes: string | null;
  added_at: Date;
}

type SongListItemCreationAttributes = Optional<SongListItemAttributes, "item_id" | "position" | "notes" | "added_at">;

class SongListItem extends Model<SongListItemAttributes, SongListItemCreationAttributes> implements SongListItemAttributes {
  declare item_id: string;
  declare list_id: string;
  declare spotify_track_id: string;
  declare position: number | null;
  declare notes: string | null;
  declare added_at: Date;
}

SongListItem.init(
  {
    item_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: () => uuidv4(),
    },
    list_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "song_lists", key: "list_id" },
      onDelete: "CASCADE",
    },
    spotify_track_id: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    position: {
      type: DataTypes.INTEGER,
    },
    notes: {
      type: DataTypes.TEXT,
    },
    added_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "SongListItem",
    tableName: "song_list_items",
    timestamps: false,
    indexes: [
      { unique: true, fields: ["list_id", "spotify_track_id"] },
      { fields: ["list_id", "position"] },
    ],
  }
);

export default SongListItem;
