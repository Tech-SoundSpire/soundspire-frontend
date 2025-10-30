import { User } from "./User";
import Community from "./Community";
import Artist from "./Artist";
import CommunitySubscription from "./CommunitySubscription";
import Review from "./Review";
import Post from "./Post";
import Comment from "./Comment";
import Genres from "./Genres";
import Social from "./Social";

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

  // Artist and Genre associations
  Artist.belongsToMany(Genres, {
    through: "artist_genres",
    foreignKey: "artist_id",
    otherKey: "genre_id",
    as: "genres"
  });

  Genres.belongsToMany(Artist, {
    through: "artist_genres",
    foreignKey: "genre_id",
    otherKey: "artist_id",
    as: "artist"
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
}
