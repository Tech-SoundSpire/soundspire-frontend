import { NextRequest, NextResponse } from "next/server";
import { User } from "@/models";
import { getDataFromToken } from "@/utils/getDataFromToken";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> },
) {
    try {
        // Require a logged-in caller. Any authenticated user may look up another
        // user's public fields (username/name/avatar) — this is not self-scoped.
        let callerId: string | undefined;
        try {
            callerId = getDataFromToken(request);
        } catch {
            callerId = undefined;
        }
        if (!callerId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { userId } = await params;

        const user = await User.findByPk(userId, {
            attributes: [
                "user_id",
                "username",
                "full_name",
                "profile_picture_url",
            ],
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 },
            );
        }

        return NextResponse.json({ user });
    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json(
            { error: "Failed to fetch user" },
            { status: 500 },
        );
    }
}
