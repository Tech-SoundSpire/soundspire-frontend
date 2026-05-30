import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../lib/dbConfig";
import { v4 as uuidv4 } from "uuid";

interface ListenListAttributes {
  entry_id: string;
  user_id: string;
  spotify_track_id: string;
  added_at: Date;
}

type ListenListCreationAttributes = Optional<ListenListAttributes, "entry_id" | "added_at">;

class ListenList extends Model<ListenListAttributes, ListenListCreationAttributes> implements ListenListAttributes {
  declare entry_id: string;
  declare user_id: string;
  declare spotify_track_id: string;
  declare added_at: Date;
}

ListenList.init(
  {
    entry_id: {
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
    added_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "ListenList",
    tableName: "listen_list",
    timestamps: false,
    indexes: [
      { unique: true, fields: ["user_id", "spotify_track_id"] },
      { fields: ["user_id"] },
    ],
  }
);

export default ListenList;
