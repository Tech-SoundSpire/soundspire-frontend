import Artist from "@/models/Artist";
import Community from "@/models/Community";
import Social from "@/models/Social";
import "@/models/index";
import { connectionTestingAndHelper } from "@/utils/dbConnection";

// Public community-page data for an onboarded artist, or null when the slug is unknown or
// belongs to a cached (not onboarded) artist. Shared by GET /api/community/[slug] and the
// server-rendered community page so both always return the same shape.
export async function getCommunityArtist(slug: string) {
    await connectionTestingAndHelper();
    const artist = await Artist.findOne({
        where: { slug },
        include: [
            {
                model: Community,
                as: "Communities",
                attributes: ["community_id", "name", "description", "subscription_fee", "subscription_interval", "highlights"],
            },
            { model: Social, as: "socials", attributes: ["platform", "url"] },
        ],
    });
    // Cached but not onboarded: not a real community page yet.
    if (!artist || !artist.user_id) return null;

    const data = artist.get({ plain: true }) as any;
    const community = data.Communities?.length ? data.Communities[0] : null;
    return {
        artist_id: artist.artist_id,
        user_id: artist.user_id,
        artist_name: artist.artist_name,
        bio: artist.bio,
        profile_picture_url: artist.profile_picture_url,
        cover_photo_url: artist.cover_photo_url,
        verification_status: artist.verification_status,
        socials: (data.socials || []).map((s: any) => ({ platform: s.platform, url: s.url })),
        // DECIMAL comes back as a string; keep it JSON-safe for the client component.
        community: community
            ? {
                  community_id: community.community_id,
                  name: community.name,
                  description: community.description,
                  subscription_fee: community.subscription_fee,
                  subscription_interval: community.subscription_interval,
                  highlights: community.highlights || [],
              }
            : null,
        slug,
    };
}
