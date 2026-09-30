import { NextRequest, NextResponse } from "next/server";
import { connectionTestingAndHelper } from "@/utils/dbConnection";
import { requireAdmin } from "@/utils/moderation";
import { Artist, User } from "@/models";
import { ARTIST_UNDER_REVIEW, ARTIST_VERIFIED } from "@/utils/artistReview";

// GET /api/admin/artist-review - artists awaiting the manual background check.
export async function GET(request: NextRequest) {
  try {
    await connectionTestingAndHelper();
    const admin = await requireAdmin(request);
    if ("error" in admin) return NextResponse.json({ error: admin.error }, { status: admin.status });

    const artists = await Artist.findAll({
      where: { verification_status: ARTIST_UNDER_REVIEW },
      attributes: ["artist_id", "artist_name", "slug", "profile_picture_url", "distribution_company", "created_at"],
      include: [{ model: User, as: "user", attributes: ["email", "is_verified", "mobile_number", "city", "country"] }],
      order: [["created_at", "ASC"]],
    });

    return NextResponse.json({ artists });
  } catch (error) {
    console.error("Error listing artists under review:", error);
    return NextResponse.json({ error: "Failed to load artists" }, { status: 500 });
  }
}

// POST /api/admin/artist-review { artist_id } - approve an artist after the background check.
export async function POST(request: NextRequest) {
  try {
    await connectionTestingAndHelper();
    const admin = await requireAdmin(request);
    if ("error" in admin) return NextResponse.json({ error: admin.error }, { status: admin.status });

    const { artist_id } = await request.json();
    if (!artist_id) return NextResponse.json({ error: "artist_id is required" }, { status: 400 });

    const [updated] = await Artist.update(
      { verification_status: ARTIST_VERIFIED },
      { where: { artist_id, verification_status: ARTIST_UNDER_REVIEW } }
    );
    if (updated === 0) return NextResponse.json({ error: "Artist not found or not under review" }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error approving artist:", error);
    return NextResponse.json({ error: "Failed to approve artist" }, { status: 500 });
  }
}
