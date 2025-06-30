// models/UserVerification.ts
import { Model, DataTypes, Optional } from "sequelize";
import { sequelize } from "../lib/dbConfig";
import { UserVerificationAttributes } from "@/types/userVerification";
import { v4 as uuidv4 } from "uuid";

export type UserVerificationCreationAttributes = Optional<
  UserVerificationAttributes,
  "verification_id" | "created_at" | "is_used"
>;

export class UserVerification
  extends Model<UserVerificationAttributes, UserVerificationCreationAttributes>
  implements UserVerificationAttributes
{
  verification_id!: string;
  user_id!: string;
  verification_token!: string;
  verification_type!: "email" | "password_reset" | string;
  expires_at!: Date;
  created_at?: Date;
  is_used?: boolean;
}

UserVerification.init(
  {
    verification_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: () => uuidv4(), // Matches uuid_generate_v4()
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "user_id",
      },
      onDelete: "CASCADE",
    },
    verification_token: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    verification_type: {
      type: DataTypes.STRING(50),
      allowNull: false, // 'email', 'password_reset', etc.
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    is_used: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "UserVerification",
    tableName: "user_verification",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["user_id", "verification_type", "is_used"],
        name: "unique_active_token",
      },
    ],
  }
);
