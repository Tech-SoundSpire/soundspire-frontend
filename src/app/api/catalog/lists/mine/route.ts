import { NextRequest, NextResponse } from "next/server";
import { connectionTestingAndHelper } from "@/utils/dbConnection";
import SongList from "@/models/reviews/SongList";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    await connectionTestingAndHelper();

    const lists = await SongList.findAll({
      where: { user_id: decoded.id },
      order: [["updated_at", "DESC"]],
      raw: true,
    });

    return NextResponse.json({ lists });
  } catch (error: any) {
    console.error("Lists fetch error:", error);
    return NextResponse.json({ lists: [] }, { status: 500 });
  }
}
