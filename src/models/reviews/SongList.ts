import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../lib/dbConfig";
import { v4 as uuidv4 } from "uuid";

interface SongListAttributes {
  list_id: string;
  user_id: string;
  title: string;
  description: string | null;
  is_ranked: boolean;
  is_private: boolean;
  like_count: number;
  comment_count: number;
  created_at: Date;
  updated_at: Date;
}

type SongListCreationAttributes = Optional<SongListAttributes, "list_id" | "description" | "is_ranked" | "is_private" | "like_count" | "comment_count" | "created_at" | "updated_at">;

class SongList extends Model<SongListAttributes, SongListCreationAttributes> implements SongListAttributes {
  declare list_id: string;
  declare user_id: string;
  declare title: string;
  declare description: string | null;
  declare is_ranked: boolean;
  declare is_private: boolean;
  declare like_count: number;
  declare comment_count: number;
  declare created_at: Date;
  declare updated_at: Date;
}

SongList.init(
  {
    list_id: {
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
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    is_ranked: {
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
    modelName: "SongList",
    tableName: "song_lists",
    timestamps: false,
    indexes: [
      { fields: ["user_id"] },
      { fields: ["like_count"] },
    ],
  }
);

export default SongList;
