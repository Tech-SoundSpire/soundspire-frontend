import Notification from "@/models/Notification";
import CommunitySubscription from "@/models/CommunitySubscription";
import Community from "@/models/Community";
import Artist from "@/models/Artist";

interface NotifyOptions {
  actorImage?: string | null;
  thumbnail?: string | null;
}

// Notify all subscribers + the artist owner of a community
export async function notifyCommunitySubscribers(
  communityId: string,
  excludeUserId: string,
  message: string,
  link: string,
  type: string = "new_post",
  options: NotifyOptions = {}
) {
  const subs = await CommunitySubscription.findAll({
    where: { community_id: communityId },
    attributes: ["user_id"],
  });

  const userIds = new Set(subs.map((s) => s.user_id));

  const community = await Community.findByPk(communityId);
  if (community) {
    const artist = await Artist.findOne({ where: { artist_id: community.artist_id } });
    if (artist?.user_id) {
      userIds.add(artist.user_id);
    }
  }

  userIds.delete(excludeUserId);

  const notifications = Array.from(userIds).map((uid) => ({
    user_id: uid,
    type,
    message,
    link,
    actor_image: options.actorImage || null,
    thumbnail: options.thumbnail || null,
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
  type: string,
  options: NotifyOptions = {}
) {
  await Notification.create({
    user_id: userId,
    type,
    message,
    link,
    actor_image: options.actorImage || null,
    thumbnail: options.thumbnail || null,
  });
}
