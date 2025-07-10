import { User } from './User';
import Community from './Community';
import Artist from './Artist';
import CommunitySubscription from './CommunitySubscription';

export function defineAssociations() {
  User.hasMany(CommunitySubscription, {
    foreignKey: 'user_id',
    as: 'CommunitySubscriptions',
  });

  CommunitySubscription.belongsTo(User, {
    foreignKey: 'user_id',
  });

  Community.hasMany(CommunitySubscription, {
    foreignKey: 'community_id',
  });

  CommunitySubscription.belongsTo(Community, {
    foreignKey: 'community_id',
  });

  Artist.hasMany(Community, {
    foreignKey: 'artist_id',
  });

  Community.belongsTo(Artist, {
    foreignKey: 'artist_id',
  });
}
