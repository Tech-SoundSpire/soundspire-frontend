import { Model, DataTypes } from 'sequelize';
import sequelize from '../lib/sequelize';

// One-directional block: blocker stops seeing blocked user's content app-wide.
class Block extends Model {}

Block.init(
  {
    block_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    blocker_user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    blocked_user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Block',
    tableName: 'blocks',
    timestamps: false,
    underscored: true,
    indexes: [
      { name: 'unique_block', unique: true, fields: ['blocker_user_id', 'blocked_user_id'] },
      { name: 'idx_blocks_blocker', fields: ['blocker_user_id'] },
    ],
  }
);

export default Block;
