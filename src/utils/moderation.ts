import { NextRequest } from "next/server";
import { Op } from "sequelize";
import jwt from "jsonwebtoken";
import { User, Block } from "@/models";

// Verify the caller is an authenticated admin. Returns { userId } on success,
// or { error, status } to return from the route.
export async function requireAdmin(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) return { error: "Unauthorized", status: 401 as const };
  let userId: string;
  try {
    userId = (jwt.verify(token, process.env.JWT_SECRET!) as { id: string }).id;
  } catch {
    return { error: "Unauthorized", status: 401 as const };
  }
  const user = await User.findByPk(userId, { attributes: ["user_id", "is_admin"] });
  if (!user || !user.is_admin) return { error: "Forbidden", status: 403 as const };
  return { userId };
}

// True if the user is banned. Used to block writes immediately (before the next
// session fetch logs them out).
export async function isBanned(userId: string): Promise<boolean> {
  const user = await User.findByPk(userId, { attributes: ["is_banned"] });
  return !!user?.is_banned;
}

// Ids the viewer has blocked, plus all banned users. Content authored by any of
// these should be excluded from what the viewer sees. Pass the result into a
// Sequelize `where` as `user_id: { [Op.notIn]: ids }` (skip if empty).
export async function hiddenAuthorIds(viewerUserId: string): Promise<string[]> {
  const [blocks, banned] = await Promise.all([
    Block.findAll({
      where: { blocker_user_id: viewerUserId },
      attributes: ["blocked_user_id"],
    }),
    User.findAll({ where: { is_banned: true }, attributes: ["user_id"] }),
  ]);
  const ids = new Set<string>();
  blocks.forEach((b) => ids.add((b as unknown as { blocked_user_id: string }).blocked_user_id));
  banned.forEach((u) => ids.add(u.user_id));
  return Array.from(ids);
}

// Merge UGC visibility rules into an existing Sequelize `where`:
//  - exclude hidden rows (is_hidden = true)
//  - exclude rows authored by blocked/banned users
// `where` is mutated and returned. `authorField` is the user-id column name.
export async function applyUgcVisibility(
  where: Record<string, unknown>,
  viewerUserId: string,
  authorField: string = "user_id"
): Promise<Record<string, unknown>> {
  where.is_hidden = { [Op.ne]: true };
  const ids = await hiddenAuthorIds(viewerUserId);
  if (ids.length > 0) {
    where[authorField] = { [Op.notIn]: ids };
  }
  return where;
}
