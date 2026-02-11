import { NextRequest, NextResponse } from "next/server";
import { connectionTestingAndHelper } from "@/utils/dbConnection";
import { User } from "@/models/User";
import jwt from "jsonwebtoken";

export async function DELETE(request: NextRequest) {
  try {
    await connectionTestingAndHelper();

    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    const uid = decoded.id;

    const user = await User.findByPk(uid);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Clean up related records BEFORE deleting user (to avoid FK constraint errors)
    const seq = User.sequelize!;
    await Promise.all([
      seq.query(`DELETE FROM user_preferences WHERE user_id = :uid`, { replacements: { uid } }),
      seq.query(`DELETE FROM community_subscriptions WHERE user_id = :uid`, { replacements: { uid } }),
      seq.query(`DELETE FROM comments WHERE user_id = :uid`, { replacements: { uid } }),
      seq.query(`DELETE FROM likes WHERE user_id = :uid`, { replacements: { uid } }),
      seq.query(`DELETE FROM forum_posts WHERE user_id = :uid`, { replacements: { uid } }),
      seq.query(`DELETE FROM artist_votes WHERE user_id = :uid`, { replacements: { uid } }),
      seq.query(`DELETE FROM socials WHERE user_id = :uid`, { replacements: { uid } }),
      seq.query(`DELETE FROM user_verification WHERE user_id = :uid`, { replacements: { uid } }),
      seq.query(`UPDATE reviews SET deleted_at = NOW() WHERE user_id = :uid AND deleted_at IS NULL`, { replacements: { uid } }),
    ]);

    // Now safe to soft-delete the user
    await user.destroy();

    // Clear auth cookies
    const response = NextResponse.json({ success: true, message: "Account deleted" });
    response.cookies.delete("token");
    response.cookies.delete("user");
    return response;
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}
