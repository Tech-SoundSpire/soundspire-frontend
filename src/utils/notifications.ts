import Notification from "@/models/Notification";
import CommunitySubscription from "@/models/CommunitySubscription";
import Community from "@/models/Community";
import Artist from "@/models/Artist";

// Notify all subscribers + the artist owner of a community
export async function notifyCommunitySubscribers(
  communityId: string,
  excludeUserId: string,
  message: string,
  link: string,
  type: string = "new_post"
) {
  // Get subscribers
  const subs = await CommunitySubscription.findAll({
    where: { community_id: communityId },
    attributes: ["user_id"],
  });

  const userIds = new Set(subs.map((s) => s.user_id));

  // Also get the artist owner
  const community = await Community.findByPk(communityId);
  if (community) {
    const artist = await Artist.findOne({ where: { artist_id: community.artist_id } });
    if (artist?.user_id) {
      userIds.add(artist.user_id);
    }
  }

  // Remove the person who triggered the action
  userIds.delete(excludeUserId);

  const notifications = Array.from(userIds).map((uid) => ({
    user_id: uid,
    type,
    message,
    link,
  }));

  if (notifications.length > 0) {
    await Notification.bulkCreate(notifications);
  }
}

// Notify a single user
export async function notifyUser(
  userId: string,
  message: string,
  link: string,
  type: string
) {
  await Notification.create({ user_id: userId, type, message, link });
}
