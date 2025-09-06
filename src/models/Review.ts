import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../lib/dbConfig";
import type { Models } from "./index";

interface ReviewAttributes {
  review_id: string;
  user_id: string;
  content_type: string;
  content_id: string;
  artist_id?: string | null;
  artist_name?: string | null;
  content_name: string;
  title: string;
  text_content: string;
  rating: number;
  image_urls?: string[] | null;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
  // Association properties
  user?: any;
  artist?: any;
}

interface ReviewCreationAttributes
  extends Optional<
    ReviewAttributes,
    "review_id" | "created_at" | "updated_at"
  > {}

class Review
  extends Model<ReviewAttributes, ReviewCreationAttributes>
  implements ReviewAttributes
{
  public review_id!: string;
  public user_id!: string;
  public content_type!: string;
  public content_id!: string;
  public artist_id!: string | null;
  public artist_name!: string | null;
  public content_name!: string;
  public title!: string;
  public text_content!: string;
  public rating!: number;
  public image_urls!: string[] | null;
  public created_at!: Date;
  public updated_at!: Date;
  public deleted_at!: Date | null;

  // Association properties
  public user?: any;
  public artist?: any;
}

Review.init(
  {
    review_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    content_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    content_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    artist_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    artist_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    content_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    text_content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    rating: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    image_urls: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },

    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Review",
    tableName: "reviews",
    timestamps: false,
    underscored: true,
  },
);

export default Review;
