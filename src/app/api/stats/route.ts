import { NextResponse } from "next/server";
import { Op, QueryTypes } from "sequelize";
import { connectionTestingAndHelper } from "@/utils/dbConnection";
import { User } from "@/models/User";
import Artist from "@/models/Artist";
import Community from "@/models/Community";
import "@/models/index";

export async function GET() {
  try {
    await connectionTestingAndHelper();

    const [artistCount, fanCount, communityCount, reviewResult] = await Promise.all([
      Artist.count({ where: { user_id: { [Op.ne]: null } } }),
      User.count(),
      Community.count(),
      User.sequelize!.query(
        `SELECT COUNT(*) as count FROM reviews WHERE deleted_at IS NULL`,
        { type: QueryTypes.SELECT }
      ),
    ]);

    const reviewCount = (reviewResult as any)[0]?.count || 0;

    return NextResponse.json({
      artists: Number(artistCount),
      fans: Number(fanCount),
      communities: Number(communityCount),
      reviews: Number(reviewCount),
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { artists: 0, fans: 0, communities: 0, reviews: 0 },
      { status: 500 }
    );
  }
}
