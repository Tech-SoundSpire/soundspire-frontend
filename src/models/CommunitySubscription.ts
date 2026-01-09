import { DataTypes, Model, NonAttribute, Optional } from "sequelize";
import { sequelize } from "../lib/dbConfig";
import Community from "./Community";
import Artist from "./Artist";

// Interface for attributes
interface CommunitySubscriptionAttributes {
    subscription_id: string;
    user_id: string;
    community_id: string;
    start_date: Date;
    end_date: Date;
    is_active: boolean;
    payment_id?: string | null;
    auto_renew: boolean;
    created_at: Date;
    updated_at: Date;
}

// Optional fields for creation
type CommunitySubscriptionCreationAttributes = Optional<
    CommunitySubscriptionAttributes,
    "subscription_id" | "created_at" | "updated_at" | "is_active" | "auto_renew"
>;

class CommunitySubscription
    extends Model<
        CommunitySubscriptionAttributes,
        CommunitySubscriptionCreationAttributes
    >
    implements CommunitySubscriptionAttributes
{
    public subscription_id!: string;
    public user_id!: string;
    public community_id!: string;
    public start_date!: Date;
    public end_date!: Date;
    public is_active!: boolean;
    public payment_id!: string | null;
    public auto_renew!: boolean;
    public created_at!: Date;
    public updated_at!: Date;

    public community?: NonAttribute<Community>;
    artist: any;
}

CommunitySubscription.init(
    {
        subscription_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "users",
                key: "user_id",
            },
        },
        community_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "communities",
                key: "community_id",
            },
        },
        start_date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        end_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        payment_id: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        auto_renew: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
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
        modelName: "CommunitySubscription",
        tableName: "community_subscriptions",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        indexes: [
            { unique: true, fields: ["user_id", "community_id"] },
            { fields: ["community_id"] },
            { fields: ["user_id"] },
            { fields: ["end_date"] },
        ],
    }
);

// ✅ Define associations directly
// CommunitySubscription.belongsTo(User, { foreignKey: 'user_id' });
CommunitySubscription.belongsTo(Community, {
    foreignKey: "community_id",
    as: "community",
});

export default CommunitySubscription;
