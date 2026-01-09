import { DataTypes, Model, NonAttribute, Optional } from "sequelize";
import sequelize from "@/lib/sequelize";
import CommunitySubscription from "./CommunitySubscription";
import Artist from "./Artist";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface CommunityAttributes {
    community_id: string;
    artist_id: string;
    name: string;
    description?: string | null;
    subscription_fee: number;
    subscription_interval: string;
    created_at: Date;
    updated_at: Date;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface CommunityCreationAttributes
    extends Optional<
        CommunityAttributes,
        "community_id" | "created_at" | "updated_at"
    > {}

class Community
    extends Model<CommunityAttributes, CommunityCreationAttributes>
    implements CommunityAttributes
{
    public community_id!: string;
    public artist_id!: string;
    public name!: string;
    public description!: string | null;
    public subscription_fee!: number;
    public subscription_interval!: string;
    public created_at!: Date;
    public updated_at!: Date;
    public artist?: NonAttribute<Artist>;
}

Community.init(
    {
        community_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        artist_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "artists",
                key: "artist_id",
            },
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        subscription_fee: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        subscription_interval: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: "monthly",
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
        modelName: "Community",
        tableName: "communities",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        indexes: [
            {
                unique: true,
                fields: ["artist_id", "name"],
            },
        ],
    }
);
Community.belongsTo(Artist, {
    foreignKey: "artist_id",
    as: "artist",
});
export default Community;
