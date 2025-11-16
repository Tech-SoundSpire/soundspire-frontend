import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "@/lib/sequelize";

interface SocialAttributes {
  id: string;
  user_id?: string | null;
  artist_id?: string | null;
  platform: string; // e.g. 'instagram', 'twitter'
  external_id: string; // e.g. '@artistname' or numeric id
  url?: string | null;
  created_at: Date;
  updated_at: Date;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface SocialCreationAttributes
  extends Optional<SocialAttributes, "id" | "created_at" | "updated_at"> {}


class Social
  extends Model<SocialAttributes, SocialCreationAttributes>
  implements SocialAttributes
{
  public id!: string;
  public user_id!: string | null;
  public artist_id!: string | null;
  public platform!: string;
  public external_id!: string;
  public url!: string | null;
  public created_at!: Date;
  public updated_at!: Date;
}

Social.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "user_id",
      },
    },
    artist_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "artists",
        key: "artist_id",
      },
    },
    platform: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    external_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    modelName: "Social",
    tableName: "socials",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Social;