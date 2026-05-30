import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../lib/dbConfig";
import { v4 as uuidv4 } from "uuid";

interface ListenDiaryAttributes {
  entry_id: string;
  user_id: string;
  spotify_track_id: string;
  listened_date: string;
  rating: number | null;
  liked: boolean;
  tags: string[] | null;
  notes: string | null;
  created_at: Date;
}

type ListenDiaryCreationAttributes = Optional<ListenDiaryAttributes, "entry_id" | "rating" | "liked" | "tags" | "notes" | "created_at">;

class ListenDiary extends Model<ListenDiaryAttributes, ListenDiaryCreationAttributes> implements ListenDiaryAttributes {
  declare entry_id: string;
  declare user_id: string;
  declare spotify_track_id: string;
  declare listened_date: string;
  declare rating: number | null;
  declare liked: boolean;
  declare tags: string[] | null;
  declare notes: string | null;
  declare created_at: Date;
}

ListenDiary.init(
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
    listened_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    rating: {
      type: DataTypes.DECIMAL(2, 1),
      validate: { min: 0.5, max: 5.0 },
    },
    liked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
    },
    notes: {
      type: DataTypes.TEXT,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "ListenDiary",
    tableName: "listen_diary",
    timestamps: false,
    indexes: [
      { fields: ["user_id", "listened_date"] },
      { fields: ["spotify_track_id"] },
    ],
  }
);

export default ListenDiary;
