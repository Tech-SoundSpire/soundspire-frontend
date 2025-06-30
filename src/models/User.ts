import { Model, DataTypes, Sequelize, Optional } from "sequelize";
import { sequelize } from "../lib/dbConfig";
import { v4 as uuidv4 } from "uuid";
import { UserAttributes } from "@/types/user";

type UserCreationAttributes = Optional<
  UserAttributes,
  | "user_id"
  | "created_at"
  | "updated_at"
  | "is_verified"
  | "is_artist"
  | "spotify_linked"
  | "password_hash"
  | "gender"
  | "date_of_birth"
  | "city"
  | "mobile_number"
>;

export class UserInstance
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  user_id!: string;
  username!: string;
  email!: string;
  password_hash?: string;
  full_name?: string;
  gender?: "male" | "female";
  date_of_birth?: Date;
  city?: string;
  country?: string;
  mobile_number?: string;
  profile_picture_url?: string;
  bio?: string;
  is_verified!: boolean;
  is_artist!: boolean;
  google_id?: string;
  spotify_linked!: boolean;
  created_at?: Date;
  updated_at?: Date;
  last_login?: Date;
  deleted_at?: Date;
}

export const User = sequelize.define<UserInstance>(
  "User",
  {
    user_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: () => uuidv4(),
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: "User name cannot be empty" },
      },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: { msg: "Enter a valid email" },
        notEmpty: { msg: "Email is required" },
      },
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: true, // optional here; validate before creation
    },
    full_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    gender: {
      type: DataTypes.ENUM("male", "female"),
      allowNull: true,
    },
    date_of_birth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    mobile_number: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    profile_picture_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_artist: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    google_id: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: true,
    },
    spotify_linked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    }
  },
  {
    tableName: "users",
    timestamps: false, // or true if you want Sequelize to manage timestamps automatically
    paranoid: true,
    indexes: [
      { name: "idx_users_email", fields: ["email"] },
      { name: "idx_users_username", fields: ["username"] },
    ],
  }
);
