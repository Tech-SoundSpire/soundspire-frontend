import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@/lib/sequelize';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface UserAttributes {
  user_id: string;
  username: string;
  email: string;
  password_hash?: string | null;
  full_name: string | null;
  gender?: string | null;
  date_of_birth?: Date | null;
  city?: string | null;
  country?: string | null;
  mobile_number?: string | null;
  profile_picture_url?: string | null;
  bio?: string | null;
  is_verified: boolean;
  is_artist: boolean;
  google_id?: string | null;
  spotify_linked: boolean;
  created_at: Date;
  updated_at: Date;
  last_login?: Date | null;
  deleted_at?: Date | null;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface UserCreationAttributes extends Optional<UserAttributes, 'user_id' | 'created_at' | 'updated_at' | 'is_verified' | 'is_artist' | 'spotify_linked'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public user_id!: string;
  public username!: string;
  public email!: string;
  public password_hash!: string | null;
  public full_name!: string | null;
  public gender!: string | null;
  public date_of_birth!: Date | null;
  public city!: string | null;
  public country!: string | null;
  public mobile_number!: string | null;
  public profile_picture_url!: string | null;
  public bio!: string | null;
  public is_verified!: boolean;
  public is_artist!: boolean;
  public google_id!: string | null;
  public spotify_linked!: boolean;
  public created_at!: Date;
  public updated_at!: Date;
  public last_login!: Date | null;
  public deleted_at!: Date | null;
}

User.init(
  {
    user_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: false,
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    full_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    gender: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    date_of_birth: {
      type: DataTypes.DATE,
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
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
    indexes: [
      { fields: ['email'] },
      { fields: ['username'] },
      { fields: ['google_id'] },
    ],
  }
);

export default User;