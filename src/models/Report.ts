import { Model, DataTypes } from 'sequelize';
import sequelize from '../lib/sequelize';

// Polymorphic report: one row per user-submitted report against any UGC surface.
// target_type says which kind of thing target_id points at (not a real FK - it
// references 4 different tables). See the UGC compliance design doc.
export const REPORT_TARGET_TYPES = ['chat_message', 'fan_art', 'review', 'user'] as const;
export const REPORT_REASONS = ['spam', 'harassment', 'hate', 'sexual', 'violence', 'other'] as const;
export const REPORT_STATUSES = ['open', 'actioned', 'dismissed'] as const;

class Report extends Model {}

Report.init(
  {
    report_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    reporter_user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    target_type: {
      type: DataTypes.ENUM(...REPORT_TARGET_TYPES),
      allowNull: false,
    },
    target_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    reason: {
      type: DataTypes.ENUM(...REPORT_REASONS),
      allowNull: false,
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...REPORT_STATUSES),
      allowNull: false,
      defaultValue: 'open',
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Report',
    tableName: 'reports',
    timestamps: false,
    underscored: true,
    indexes: [
      { name: 'idx_reports_status_created', fields: ['status', 'created_at'] },
      { name: 'idx_reports_target', fields: ['target_type', 'target_id'] },
    ],
  }
);

export default Report;
