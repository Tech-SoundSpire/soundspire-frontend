import { NextRequest, NextResponse } from "next/server";
import { getDataFromToken } from "@/utils/getDataFromToken";
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

export async function GET(request: NextRequest) {
    try {
        // Identify the caller from the verified JWT — never trust a client-supplied
        // email, otherwise anyone can read any user's PII.
        let userId: string | undefined;
        try {
            userId = getDataFromToken(request);
        } catch {
            userId = undefined;
        }

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

    const user = await User.findOne({
      where: { user_id: userId },
      attributes: [
        'full_name',
        'username',
        'gender',
        'email',
        'mobile_number',
        'date_of_birth',
        'city',
        'country',
        'profile_picture_url',
        'spotify_linked',
      ],
      include: [
        {
          model: CommunitySubscription,
          as: 'CommunitySubscriptions',
          required: false,
          include: [
            {
              model: Community,
              include: [
                {
                  model: Artist,
                  as: "Artist",
                  attributes: ['artist_name', 'profile_picture_url'],
                },
              ],
            },
          ],
        },
      ],
    });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

    const userData = user.toJSON() as UserWithSubscriptions;

    const subscriptions = userData.CommunitySubscriptions?.map((sub) => ({
      name: sub.Community?.name || 'Unknown',
      image: sub.Community?.Artist?.profile_picture_url || '/default-community.jpg',
    })) || [];

    return NextResponse.json({
      ...userData,
      subscriptions,
    });
  } catch (error: unknown) {
    console.error('Profile fetch error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
    try {
        // Identify the caller from the verified JWT — the profile being updated is
        // always the caller's own, never one selected by a client-supplied email.
        let userId: string | undefined;
        try {
            userId = getDataFromToken(request);
        } catch {
            userId = undefined;
        }

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const {
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

        // Only include fields that were actually provided, so a partial update
        // (e.g. the Spotify-link toggle) doesn't null out other columns.
        const updates: Record<string, unknown> = {};
        if (full_name !== undefined) updates.full_name = full_name;
        if (username !== undefined) updates.username = username;
        if (gender !== undefined) updates.gender = gender;
        if (mobile_number !== undefined) updates.mobile_number = mobile_number;
        if (date_of_birth !== undefined) updates.date_of_birth = date_of_birth;
        if (city !== undefined) updates.city = city;
        if (country !== undefined) updates.country = country;
        if (profile_picture_url !== undefined) updates.profile_picture_url = profile_picture_url;
        if (spotify_linked !== undefined) updates.spotify_linked = spotify_linked;

        const [updatedCount] = await User.update(
            updates,
            { where: { user_id: userId } }
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
