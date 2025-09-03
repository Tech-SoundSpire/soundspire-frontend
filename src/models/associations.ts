import { User } from "./User";
import Community from "./Community";
import Artist from "./Artist";
import CommunitySubscription from "./CommunitySubscription";
import Review from "./Review";
import Post from "./Post";
import Comment from "./Comment";

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
  });

  Community.belongsTo(Artist, {
    foreignKey: "artist_id",
  });

  // Post associations
  Artist.hasMany(Post, {
    foreignKey: "artist_id",
    as: "posts",
  });

  Post.belongsTo(Artist, {
    foreignKey: "artist_id",
  });

  // Comment associations
  User.hasMany(Comment, {
    foreignKey: "user_id",
    as: "comments",
  });

  Comment.belongsTo(User, {
    foreignKey: "user_id",
  });
}
