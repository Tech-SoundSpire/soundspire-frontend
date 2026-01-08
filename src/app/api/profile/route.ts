import { NextResponse } from "next/server";
// Import concrete model classes directly to satisfy Sequelize include
import { User } from "@/models/User";
import CommunitySubscription from "@/models/CommunitySubscription";
import Community from "@/models/Community";
import Artist from "@/models/Artist";
// Ensure associations are registered
import "@/models/index";
import { UserAttributes } from "@/types/user";

interface ArtistAttributes {
    artist_name: string;
    profile_picture_url?: string;
}

interface CommunityAttributes {
    name: string;
    Artist?: ArtistAttributes;
}

interface CommunitySubscriptionAttributes {
    Community?: CommunityAttributes;
}

interface UserWithSubscriptions
    extends Omit<UserAttributes, "CommunitySubscriptions"> {
    CommunitySubscriptions?: CommunitySubscriptionAttributes[];
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get("email");

        if (!email) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            );
        }

        const user = await User.findOne({
            where: { email },
            attributes: [
                "full_name",
                "username",
                "gender",
                "email",
                "mobile_number",
                "date_of_birth",
                "city",
                "country",
                "profile_picture_url",
                "spotify_linked",
            ],
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const userData = user.toJSON() as UserWithSubscriptions;

        return NextResponse.json({
            ...userData,
        });
    } catch (error: unknown) {
        console.error("Profile fetch error:", error);
        const errorMessage =
            error instanceof Error
                ? error.message
                : "An unknown error occurred";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const {
            email,
            full_name,
            username,
            gender,
            mobile_number,
            date_of_birth,
            city,
            country,
            profile_picture_url,
            spotify_linked,
        } = await request.json();

        if (!email || !full_name || !username) {
            return NextResponse.json(
                { error: "Email, full_name, and username are required" },
                { status: 400 }
            );
        }

        const [updatedCount] = await User.update(
            {
                full_name,
                username,
                gender,
                mobile_number,
                date_of_birth,
                city,
                country,
                profile_picture_url,
                spotify_linked,
            },
            { where: { email } }
        );

        if (updatedCount === 0) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: "Profile updated successfully" });
    } catch (error: unknown) {
        console.error("Profile update error:", error);
        const errorMessage =
            error instanceof Error
                ? error.message
                : "An unknown error occurred";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
