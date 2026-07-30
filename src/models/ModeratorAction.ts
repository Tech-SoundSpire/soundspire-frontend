import { Model, DataTypes } from 'sequelize';
import sequelize from '../lib/sequelize';

// Audit trail: one row per moderator action (hide/unhide/ban/unban/dismiss).
export const MODERATOR_ACTIONS = ['hide', 'unhide', 'ban', 'unban', 'dismiss'] as const;

class ModeratorAction extends Model {}

ModeratorAction.init(
  {
    action_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    moderator_user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    action: {
      type: DataTypes.ENUM(...MODERATOR_ACTIONS),
      allowNull: false,
    },
    target_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    target_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'ModeratorAction',
    tableName: 'moderator_actions',
    timestamps: false,
    underscored: true,
    indexes: [
      { name: 'idx_modactions_created', fields: ['created_at'] },
    ],
  }
);

export default ModeratorAction;
