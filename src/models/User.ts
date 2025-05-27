
import { Model, DataTypes, Sequelize, Optional } from "sequelize";
import { sequelize } from "../lib/dbConfig";
import {v4 as uuidv4} from 'uuid';
import { UserAttributes } from "@/types/user";


// Some fields are optional when creating a new user:
type UserCreationAttributes = Optional<UserAttributes, 'user_id' | 'created_at' | 'updated_at' | 'isVerified' | 'is_artist' | 'spotify_linked' | 'isAdmin'>;

export class UserInstance extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes {
  user_id!: string;
  username!: string;
  email!: string;
  password_hash!: string;
  full_name!: string;
  gender!: 'male' | 'female';
  date_of_birth?: Date;
  city?: string;
  country?: string;
  mobile_number!: string;
  profile_picture_url?: string;
  bio?: string;
  isVerified!: boolean;
  is_artist!: boolean;
  google_id?: string;
  spotify_linked!: boolean;
  created_at?: Date;
  updated_at?: Date;
  last_login?: Date;
  deleted_at?: Date;
  isAdmin!: boolean;
  forgotPasswordToken?: string;
  forgotPasswordTokenExpiry?: Date;
  verifyToken?: string;
  verifyTokenExpiry?: Date;
}


export const User = sequelize.define<UserInstance>(
  "User",
  {
    user_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: uuidv4,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notNull: { msg: "Provide user name" },
        notEmpty: { msg: "User name cannot be empty" },
      },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        notNull: { msg: "Email is required" },
        isEmail: { msg: "Enter a valid email" },
      },
    },
    password_hash: { //Change this name
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notNull: { msg: "Provide a valid password" },
      },
    },
    full_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notNull: { msg: "Provide name" },
        notEmpty: { msg: "Name cannot be empty" },
      },
    },
    gender: {
      type: DataTypes.ENUM("male", "female"),
      allowNull: false,
      validate: {
        notNull: { msg: "Enter your gender" },
      },
    },
    date_of_birth: {
      type: DataTypes.DATEONLY,
      // allowNull: false,
    },
    city: {
      type: DataTypes.STRING(100),
      // allowNull: false,
    },
    country: {
      type: DataTypes.STRING(100),
     // allowNull: true,
    },
    mobile_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        is: {
          args: /^[0-9]{10}$/,
          msg: "Provide a valid 10-digit mobile number",
        },
      },
    },
    profile_picture_url: {
      type: DataTypes.TEXT,
     // allowNull: true,
    },
    bio: {
      type: DataTypes.TEXT,
    //  allowNull: true,
    },
    isVerified: {
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
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    forgotPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    forgotPasswordTokenExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    verifyToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    verifyTokenExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "users",
    timestamps: false,
    paranoid: true,
    indexes: [ //for immediate searching
      {
        name: "idx_users_email",
        fields: ["email"],
      },
      {
        name: "idx_users_username",
        fields: ["username"],
      },
    ],
  }
);

