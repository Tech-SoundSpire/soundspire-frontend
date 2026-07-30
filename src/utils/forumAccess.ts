import { Op } from "sequelize";
import { Forum, Community, Artist, CommunitySubscription } from "@/models";

// Verify a user may access a forum: either the owning artist, or an active
// subscriber. Returns the Forum on success, or an { error, status } to return.
export async function verifyForumAccess(forumId: string, userId: string) {
  const forum = await Forum.findByPk(forumId);
  if (!forum) return { error: "Forum not found", status: 404 as const };

  const community = await Community.findByPk(forum.community_id);
  if (!community) return { error: "Community not found", status: 404 as const };

  const isOwner = !!(await Artist.findOne({
    where: { artist_id: community.artist_id, user_id: userId },
  }));

  if (!isOwner) {
    const sub = await CommunitySubscription.findOne({
      where: {
        user_id: userId,
        community_id: forum.community_id,
        is_active: true,
        end_date: { [Op.gte]: new Date() },
      },
    });
    if (!sub) return { error: "Active subscription required", status: 403 as const };
  }

  return { forum, community, isOwner };
}
