import { User } from "./User";
import Community from "./Community";
import Artist from "./Artist";
import CommunitySubscription from "./CommunitySubscription";
import Review from "./Review";
import Post from "./Post";
import Comment from "./Comment";
import Genres from "./Genres";
import Social from "./Social";
import Forum from "./Forum";
import ForumPost from "./ForumPost";
import Like from "./Like";

export function defineAssociations() {
  User.hasMany(CommunitySubscription, {
    foreignKey: "user_id",
    as: "CommunitySubscriptions",
  });

  CommunitySubscription.belongsTo(User, {
    foreignKey: "user_id",
  });

  Community.hasMany(CommunitySubscription, {
    foreignKey: "community_id",
  });

  CommunitySubscription.belongsTo(Community, {
    foreignKey: "community_id",
  });

  // Review associations
  Review.belongsTo(User, {
    foreignKey: "user_id",
    as: "user",
  });

  User.hasMany(Review, {
    foreignKey: "user_id",
    as: "reviews",
  });

  Review.belongsTo(Artist, {
    foreignKey: "artist_id",
    as: "artist",
  });

  Artist.hasMany(Review, {
    foreignKey: "artist_id",
    as: "reviews",
  });

  // Artist associations
  Artist.belongsTo(User, {
    foreignKey: "user_id",
    as: "user",
  });

  User.hasOne(Artist, {
    foreignKey: "user_id",
    as: "artist",
  });

  Artist.hasMany(Community, {
    foreignKey: "artist_id",
    as: "Communities",
  });

  Community.belongsTo(Artist, {
    foreignKey: "artist_id",
    as: "Artist",
  });

  // Artist and Genre associations
  Artist.belongsToMany(Genres, {
    through: "artist_genres",
    foreignKey: "artist_id",
    otherKey: "genre_id",
    as: "genres",
    timestamps: false
  });

  Genres.belongsToMany(Artist, {
    through: "artist_genres",
    foreignKey: "genre_id",
    otherKey: "artist_id",
    as: "artist",
    timestamps: false
  });

  // Post associations
  Artist.hasMany(Post, {
    foreignKey: "artist_id",
    as: "posts",
  });

  Community.hasMany(Post, {
    foreignKey: "community_id",
    as: "posts",
  });

  // Comment associations
  User.hasMany(Comment, {
    foreignKey: "user_id",
    as: "comments",
  });

  Comment.belongsTo(User, {
    foreignKey: "user_id",
  });

  // Social Link associations
  User.hasMany(Social, {
    foreignKey: "user_id",
    as: "socials",
    onDelete: "CASCADE",
  });
  Social.belongsTo(User, {
    foreignKey: "user_id",
  });

  Artist.hasMany(Social, {
    foreignKey: "artist_id",
    as: "socials",
    onDelete: "CASCADE",
  });
  Social.belongsTo(Artist, {
    foreignKey: "artist_id"
  });

  // Forum and ForumPost associations
  Community.hasMany(Forum, {
    foreignKey: "community_id",
    as: "forums",
  });

  Forum.belongsTo(Community, {
    foreignKey: "community_id",
    as: "Community",
  });

  Forum.hasMany(ForumPost, {
    foreignKey: "forum_id",
    as: "posts",
  });

  ForumPost.belongsTo(Forum, {
    foreignKey: "forum_id",
    as: "forum",
  });

  ForumPost.belongsTo(User, {
    foreignKey: "user_id",
    as: "user",
  });

  User.hasMany(ForumPost, {
    foreignKey: "user_id",
    as: "forumPosts",
  });

  ForumPost.hasMany(Like, {
    foreignKey: "forum_post_id",
    as: "likes",
  });

  Like.belongsTo(ForumPost, {
    foreignKey: "forum_post_id",
  });

  ForumPost.hasMany(Comment, {
    foreignKey: "forum_post_id",
    as: "comments",
  });

  Comment.belongsTo(ForumPost, {
    foreignKey: "forum_post_id",
  });
}
