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
  favorite_soundcharts_artists: object[]; // SoundCharts artist data [{name, soundcharts_uuid, imageUrl}]
  genre_names: string[];
  language_names: string[];
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
  declare preference_id: string;
  declare user_id: string;
  declare genres: string[];
  declare languages: string[];
  declare favorite_artists: string[]; // UUID array for artist IDs
  declare favorite_soundcharts_artists: object[];
  declare genre_names: string[];
  declare language_names: string[];
  declare spotify_id?: string;
  declare created_at?: Date;
  declare updated_at?: Date;

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
    favorite_soundcharts_artists: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    genre_names: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    language_names: {
      type: DataTypes.JSONB,
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
