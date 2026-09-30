import Artist from "@/models/Artist";

// New artist signups start "under_review" until the SoundSpire team finishes the manual
// background check and approves them (status → "verified"). Legacy rows keep "pending",
// which is NOT gated, so existing artists are unaffected.
export const ARTIST_UNDER_REVIEW = "under_review";
export const ARTIST_VERIFIED = "verified";

export const UNDER_REVIEW_MESSAGE =
  "Thank you for verifying your email. The SoundSpire team will be in touch shortly.";

// True when this user is an artist whose profile is still awaiting manual review.
// Such users must not get a session on any login path.
export async function isArtistUnderReview(user: { user_id: string; is_artist?: boolean | null }): Promise<boolean> {
  if (!user.is_artist) return false;
  const artist = await Artist.findOne({ where: { user_id: user.user_id }, attributes: ["verification_status"] });
  return artist?.verification_status === ARTIST_UNDER_REVIEW;
}
