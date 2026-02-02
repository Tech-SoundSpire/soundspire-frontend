import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '@/lib/dbConfig';

interface ForumAttributes {
  forum_id: string;
  community_id: string;
  name: string;
  description?: string;
  forum_type: string;
  created_at: Date;
  updated_at: Date;
}

interface ForumCreationAttributes extends Optional<ForumAttributes, 'forum_id' | 'description' | 'created_at' | 'updated_at'> {}

class Forum extends Model<ForumAttributes, ForumCreationAttributes> implements ForumAttributes {
  declare forum_id: string;
  declare community_id: string;
  declare name: string;
  declare description: string;
  declare forum_type: string;
  declare created_at: Date;
  declare updated_at: Date;
}

Forum.init({
  forum_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  community_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'communities',
      key: 'community_id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  forum_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  tableName: 'forums',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Forum;
