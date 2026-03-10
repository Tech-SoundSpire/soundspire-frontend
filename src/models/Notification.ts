import { Model, DataTypes, Sequelize } from "sequelize";
import { sequelize } from "../lib/dbConfig";
import { v4 as uuidv4 } from "uuid";

export class Notification extends Model {
  declare notification_id: string;
  declare user_id: string;
  declare type: string; // 'new_post' | 'comment_like' | 'comment_reply' | 'fanart_like' | 'fanart_comment'
  declare message: string;
  declare link: string; // URL to navigate to
  declare is_read: boolean;
  declare actor_image: string | null;
  declare thumbnail: string | null;
  declare created_at: Date;
}

Notification.init(
  {
    notification_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: () => uuidv4(),
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "users", key: "user_id" },
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    link: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    actor_image: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    thumbnail: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  },
  {
    sequelize,
    tableName: "notifications",
    timestamps: false,
    indexes: [
      { fields: ["user_id"] },
      { fields: ["user_id", "is_read"] },
    ],
  }
);

export default Notification;
