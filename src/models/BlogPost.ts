import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "@/lib/sequelize";

// One block of a blog post. Stored as structured JSON (not HTML) so posts render safely.
export type BlogBlock =
    | { type: "heading"; text: string }
    | { type: "text"; text: string }
    | { type: "image"; url: string; caption?: string };

interface BlogPostAttributes {
    post_id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    cover_image_url: string | null;
    content: BlogBlock[];
    author_user_id: string;
    created_at: Date;
    updated_at: Date;
}

type BlogPostCreationAttributes = Optional<
    BlogPostAttributes,
    "post_id" | "excerpt" | "cover_image_url" | "created_at" | "updated_at"
>;

// Blog posts (/blog). Only @soundspire.online accounts can create or edit them.
class BlogPost extends Model<BlogPostAttributes, BlogPostCreationAttributes> implements BlogPostAttributes {
    declare post_id: string;
    declare slug: string;
    declare title: string;
    declare excerpt: string | null;
    declare cover_image_url: string | null;
    declare content: BlogBlock[];
    declare author_user_id: string;
    declare created_at: Date;
    declare updated_at: Date;
}

BlogPost.init(
    {
        post_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        slug: { type: DataTypes.STRING(200), allowNull: false, unique: true },
        title: { type: DataTypes.STRING(200), allowNull: false },
        excerpt: { type: DataTypes.TEXT, allowNull: true },
        cover_image_url: { type: DataTypes.TEXT, allowNull: true },
        content: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
        author_user_id: { type: DataTypes.UUID, allowNull: false, references: { model: "users", key: "user_id" } },
        created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
        sequelize,
        modelName: "BlogPost",
        tableName: "blog_posts",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

export default BlogPost;
