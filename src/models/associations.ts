import User from './User';
import Artist from './Artist';
import Community from './Community';
import CommunitySubscription from './CommunitySubscription';

export function defineAssociations() {
  // User associations
  User.hasMany(CommunitySubscription, { foreignKey: 'user_id' });
  User.hasOne(Artist, { foreignKey: 'user_id' });

  // Artist associations
  Artist.belongsTo(User, { foreignKey: 'user_id' });
  Artist.hasMany(Community, { foreignKey: 'artist_id' });

  // Community associations
  Community.belongsTo(Artist, { foreignKey: 'artist_id' });
  Community.hasMany(CommunitySubscription, { foreignKey: 'community_id' });

  // CommunitySubscription associations
  CommunitySubscription.belongsTo(User, { foreignKey: 'user_id' });
  CommunitySubscription.belongsTo(Community, { foreignKey: 'community_id' });
}