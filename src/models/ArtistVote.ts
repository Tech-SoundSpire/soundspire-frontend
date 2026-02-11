import { Model, DataTypes, Sequelize } from "sequelize";
import { sequelize } from "../lib/dbConfig";
import { v4 as uuidv4 } from "uuid";

export class ArtistVote extends Model {
  declare vote_id: string;
  declare soundcharts_uuid: string;
  declare artist_name: string;
  declare image_url: string | null;
  declare user_id: string;
  declare created_at: Date;
}

ArtistVote.init(
  {
    vote_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: () => uuidv4(),
    },
    soundcharts_uuid: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    artist_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    image_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "users", key: "user_id" },
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  },
  {
    sequelize,
    tableName: "artist_votes",
    timestamps: false,
    indexes: [
      { unique: true, fields: ["soundcharts_uuid", "user_id"], name: "unique_vote_per_user" },
      { fields: ["soundcharts_uuid"] },
    ],
  }
);

export default ArtistVote;
