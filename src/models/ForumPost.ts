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
  is_pinned: boolean;
  is_answered: boolean;
  created_at: Date;
  updated_at: Date;
}

interface ForumPostCreationAttributes extends Optional<ForumPostAttributes, 'forum_post_id' | 'title' | 'content' | 'media_type' | 'media_urls' | 'is_pinned' | 'is_answered' | 'created_at' | 'updated_at'> {}

class ForumPost extends Model<ForumPostAttributes, ForumPostCreationAttributes> implements ForumPostAttributes {
  public forum_post_id!: string;
  public forum_id!: string;
  public user_id!: string;
  public title!: string;
  public content!: string;
  public media_type!: string;
  public media_urls!: string[];
  public is_pinned!: boolean;
  public is_answered!: boolean;
  public created_at!: Date;
  public updated_at!: Date;
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
