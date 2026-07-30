import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '@/lib/dbConfig';

interface ForumPostAttributes {
  forum_post_id: string;
  forum_id: string;
  user_id: string;
  title?: string;
  content?: string;
  media_type?: string;
  media_urls?: string[];
  parent_post_id?: string | null;
  reactions?: Record<string, string[]>;
  is_pinned: boolean;
  is_answered: boolean;
  is_hidden: boolean;
  hidden_reason?: string | null;
  created_at: Date;
  updated_at: Date;
}

interface ForumPostCreationAttributes extends Optional<ForumPostAttributes, 'forum_post_id' | 'title' | 'content' | 'media_type' | 'media_urls' | 'parent_post_id' | 'reactions' | 'is_pinned' | 'is_answered' | 'is_hidden' | 'hidden_reason' | 'created_at' | 'updated_at'> {}

class ForumPost extends Model<ForumPostAttributes, ForumPostCreationAttributes> implements ForumPostAttributes {
  declare forum_post_id: string;
  declare forum_id: string;
  declare user_id: string;
  declare title: string;
  declare content: string;
  declare media_type: string;
  declare media_urls: string[];
  declare parent_post_id: string | null;
  declare reactions: Record<string, string[]>;
  declare is_pinned: boolean;
  declare is_answered: boolean;
  declare is_hidden: boolean;
  declare hidden_reason: string | null;
  declare created_at: Date;
  declare updated_at: Date;
}

ForumPost.init({
  forum_post_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  forum_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'forums',
      key: 'forum_id'
    }
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  media_type: {
    type: DataTypes.STRING,
    allowNull: true
  },
  media_urls: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    defaultValue: [],
    allowNull: true
  },
  parent_post_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  reactions: {
    type: DataTypes.JSONB,
    defaultValue: {},
    allowNull: true
  },
  is_pinned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  is_answered: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  is_hidden: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  hidden_reason: {
    type: DataTypes.TEXT,
    allowNull: true
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
  tableName: 'forum_posts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default ForumPost;
