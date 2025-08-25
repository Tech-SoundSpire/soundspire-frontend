import { Model, DataTypes, Sequelize, Optional } from "sequelize";
import { sequelize } from "../lib/dbConfig";
import { v4 as uuidv4 } from "uuid";
import type { Models } from './index';

export interface UserPreferencesAttributes {
  preference_id: string;
  user_id: string;
  genres: string[];
  languages: string[];
  favorite_artists: string[]; // UUID array for artist IDs from artists table
  spotify_id?: string;
  created_at?: Date;
  updated_at?: Date;
}

type UserPreferencesCreationAttributes = Optional<
  UserPreferencesAttributes,
  | "preference_id"
  | "created_at"
  | "updated_at"
>;

export class UserPreferences
  extends Model<UserPreferencesAttributes, UserPreferencesCreationAttributes>
  implements UserPreferencesAttributes
{
  public preference_id!: string;
  public user_id!: string;
  public genres!: string[];
  public languages!: string[];
  public favorite_artists!: string[]; // UUID array for artist IDs
  public spotify_id?: string;
  public created_at?: Date;
  public updated_at?: Date;

  static associate(models: Models) {
    UserPreferences.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
    });
  }
}

UserPreferences.init(
  {
    preference_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: () => uuidv4(),
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    genres: {
      type: DataTypes.ARRAY(DataTypes.UUID),
      allowNull: false,
      defaultValue: [],
    },
    languages: {
      type: DataTypes.ARRAY(DataTypes.UUID),
      allowNull: false,
      defaultValue: [],
    },
    favorite_artists: {
      type: DataTypes.ARRAY(DataTypes.UUID), // UUID array for artist IDs
      allowNull: false,
      defaultValue: [],
    },
    spotify_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
  },
  {
    sequelize,
    tableName: "user_preferences",
    timestamps: false,
  }
);

export default UserPreferences;
