import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

interface DecodedToken {
  id: string;
}

// Returns user id if available, otherwise null. Never throws for missing/invalid token.
export const getDataFromToken = (request: NextRequest): string | null => {
  try {
    // Prefer explicit JWT cookie named 'token' if present
    const token = request.cookies.get("token")?.value;
    if (token) {
      try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
        return decodedToken.id;
      } catch {
        // fall through to try other sources
      }
    }

    // Fallback: parse 'user' cookie (set by app) and return its id
    const userCookie = request.cookies.get("user")?.value;
    if (userCookie) {
      try {
        const decoded = decodeURIComponent(userCookie);
        const userObj = JSON.parse(decoded);
        return userObj?.id || userObj?.user_id || null;
      } catch {
        // ignore parse errors
      }
    }

    return null;
  } catch {
    return null;
  }
};