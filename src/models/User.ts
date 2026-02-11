// models/User.ts
import { Model, DataTypes, Sequelize, Optional } from "sequelize";
import { sequelize } from "../lib/dbConfig";
import { v4 as uuidv4 } from "uuid";
import { UserAttributes } from "@/types/user";
import type { Models } from "./index";

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

export class User
    extends Model<UserAttributes, UserCreationAttributes>
    implements UserAttributes
{
    declare user_id: string;
    declare username: string;
    declare email: string;
    declare password_hash?: string;
    declare full_name?: string;
    declare gender?: "Male" | "Female" | "Other";
    declare date_of_birth?: Date;
    declare city?: string;
    declare country?: string;
    declare mobile_number?: string;
    declare profile_picture_url?: string;
    declare bio?: string;
    declare is_verified: boolean;
    declare is_artist: boolean;
    declare google_id?: string;
    declare spotify_linked: boolean;
    declare created_at?: Date;
    declare updated_at?: Date;
    declare last_login?: Date;
    declare deleted_at?: Date;

    static associate(models: Models) {
        // User.hasOne(models.Artist, {
        //   foreignKey: "user_id",
        //   as: "artist",
        // });
        // User.hasMany(models.Comment, {
        //   foreignKey: "user_id",
        //   as: "comments",
        // });
        // Associations are now handled centrally in associations.ts
    }
}

User.init(
    {
        user_id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: () => uuidv4(),
        },
        username: {
            type: DataTypes.STRING(50),
            allowNull: false,
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
            allowNull: true,
        },
        full_name: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        gender: {
            type: DataTypes.ENUM("Male", "Female", "Other"),
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
        },
    },
    {
        sequelize,
        tableName: "users",
        timestamps: false,
        paranoid: true,
        indexes: [
            { name: "idx_users_email", fields: ["email"] },
            { name: "idx_users_username", fields: ["username"] },
            {
                unique: true,
                fields: ["username", "is_artist"],
                name: "unique_role_username",
            },
        ],
    },
);

// Clean up related records on soft delete
User.afterDestroy(async (user) => {
    const uid = user.user_id;
    const { sequelize: seq } = User;
    if (!seq) return;
    await Promise.all([
        seq.query(`DELETE FROM user_preferences WHERE user_id = :uid`, { replacements: { uid } }),
        seq.query(`DELETE FROM community_subscriptions WHERE user_id = :uid`, { replacements: { uid } }),
        seq.query(`DELETE FROM comments WHERE user_id = :uid`, { replacements: { uid } }),
        seq.query(`DELETE FROM likes WHERE user_id = :uid`, { replacements: { uid } }),
        seq.query(`DELETE FROM forum_posts WHERE user_id = :uid`, { replacements: { uid } }),
        seq.query(`DELETE FROM artist_votes WHERE user_id = :uid`, { replacements: { uid } }),
        seq.query(`DELETE FROM socials WHERE user_id = :uid`, { replacements: { uid } }),
        seq.query(`DELETE FROM user_verification WHERE user_id = :uid`, { replacements: { uid } }),
        seq.query(`UPDATE reviews SET deleted_at = NOW() WHERE user_id = :uid AND deleted_at IS NULL`, { replacements: { uid } }),
    ]);
});
