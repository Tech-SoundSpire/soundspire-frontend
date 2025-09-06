import { Model, DataTypes, Optional, Sequelize } from "sequelize";
import { sequelize } from "../lib/dbConfig";

interface UserSpotifyTokenAttributes {
  id: string;
  user_id: string;
  access_token: string;
  refresh_token: string;
  expires_at: Date; // absolute expiry time
  scope?: string | null;
  token_type?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

type UserSpotifyTokenCreationAttributes = Optional<
  UserSpotifyTokenAttributes,
  "id" | "created_at" | "updated_at" | "scope" | "token_type"
>;

class UserSpotifyToken
  extends Model<UserSpotifyTokenAttributes, UserSpotifyTokenCreationAttributes>
  implements UserSpotifyTokenAttributes
{
  public id!: string;
  public user_id!: string;
  public access_token!: string;
  public refresh_token!: string;
  public expires_at!: Date;
  public scope?: string | null;
  public token_type?: string | null;
  public created_at?: Date;
  public updated_at?: Date;
}

UserSpotifyToken.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },
    access_token: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    refresh_token: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    scope: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    token_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  },
  {
    sequelize,
    tableName: "user_spotify_tokens",
    timestamps: false,
    indexes: [{ name: "idx_user_spotify_tokens_user_id", fields: ["user_id"] }],
  }
);

export default UserSpotifyToken;



