import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "@/lib/sequelize";
import type { Models } from "./index";

interface PayoutMethod {
  type: string; // e.g., 'paypal', 'bank_transfer'
  details: Record<string, string>; // e.g., { email: 'user@paypal.com' }
}

interface ArtistAttributes {
  artist_id: string;
  user_id: string | null;
  artist_name: string;
  bio?: string | null;
  profile_picture_url?: string | null;
  cover_photo_url?: string | null;
  verification_status?: string | null;
  third_party_platform?: string | null;
  third_party_id?: string | null;
  featured: boolean;
  payout_method?: PayoutMethod | null;
  created_at: Date;
  updated_at: Date;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface ArtistCreationAttributes
  extends Optional<
    ArtistAttributes,
    "artist_id" | "created_at" | "updated_at" | "featured"
  > {}

class Artist
  extends Model<ArtistAttributes, ArtistCreationAttributes>
  implements ArtistAttributes
{
  public artist_id!: string;
  public user_id!: string | null;
  public artist_name!: string;
  public bio!: string | null;
  public profile_picture_url!: string | null;
  public cover_photo_url!: string | null;
  public verification_status!: string | null;
  public third_party_platform!: string | null;
  public third_party_id!: string | null;
  public featured!: boolean;
  public payout_method!: PayoutMethod | null;
  public created_at!: Date;
  public updated_at!: Date;

  // Association definition
  static associate(models: Models) {
    // Artist.hasMany(models.Post, { foreignKey: 'artist_id', as: 'posts' });
    // Artist.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    // Associations are now handled centrally in associations.ts
  }
}

Artist.init(
  {
    artist_id: {
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
    artist_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    profile_picture_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    cover_photo_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    verification_status: {
      type: DataTypes.STRING(50),
      defaultValue: "pending",
    },
    third_party_platform: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    third_party_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    payout_method: {
      type: DataTypes.JSONB,
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
    modelName: "Artist",
    tableName: "artists",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [{ fields: ["artist_name"] }],
  },
);

export default Artist;
