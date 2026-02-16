import Artist from "@/models/Artist";
import Community from "@/models/Community";
import CommunitySubscription from "@/models/CommunitySubscription";
import { User } from "@/models/User";
import { type communityDataFromAPI } from "@/types/communityGetAllAPIData";
import { connectionTestingAndHelper } from "@/utils/dbConnection";
import { NextRequest, NextResponse } from "next/server";
export async function DELETE(request: NextRequest) {
    try {
        await connectionTestingAndHelper();
        const searchParams = request.nextUrl.searchParams;
        const community_id = searchParams.get("community_id");
        const user_id = searchParams.get("user_id");
        if (!user_id || !community_id) {
            return NextResponse.json(
                {
                    status: "ERROR",
                    message: "Ids weren't provided",
                    subscribed: true,
                },
                { status: 400 },
            );
        }
        const subscription = await CommunitySubscription.findOne({
            where: { user_id, community_id },
        });
        if (!subscription) {
            return NextResponse.json({
                status: "WARNING",
                message: "Subscription doesn't exist, check ids",
                subscribed: false,
            });
        }
        await subscription.destroy();
        return NextResponse.json({
            status: "SUCCESS",
            message: "Subscription successfully deleted",
            subscribed: false,
        });
    } catch (err) {
        console.error("Error fetching subscription data: ", err);
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: "Unknown Error" }, { status: 500 });
    }
}
export async function GET(request: NextRequest) {
    try {
        await connectionTestingAndHelper();
        const searchParams = request.nextUrl.searchParams;
        const community_id = searchParams.get("community_id");
        const user_id = searchParams.get("user_id");
        if (!user_id) {
            return NextResponse.json(
                {
                    status: "ERROR",
                    message: "Ids weren't provided",
                    subscribed: false,
                },
                { status: 400 },
            );
        }
        // ASKS FOR SPECIFIC ID, USED ON THE ARTIST PROFILE PAGE
        if (community_id) {
            const communitySubscription = await CommunitySubscription.findOne({
                where: { user_id: user_id, community_id: community_id },
            });
            if (communitySubscription) {
                return NextResponse.json(
                    {
                        status: "SUCCESS",
                        message: "Subscription found",
                        subscribed: true,
                    },
                    { status: 200 },
                );
            }
            return NextResponse.json(
                {
                    status: "SUCCESS",
                    message: "Subscription not found",
                    subscribed: false,
                },
                { status: 200 },
            );
        }
        // IN GENERAL TO GET ALL THE SUBSCRIPTIONS FOR A USER.
        const allSubscriptions = await CommunitySubscription.findAll({
            where: { user_id },
            include: [
                {
                    model: Community,
                    as: "community",
                    attributes: ["community_id", "name", "description"],
                    include: [
                        {
                            model: Artist,
                            as: "artist",
                            attributes: [
                                "artist_name",
                                "profile_picture_url",
                                "cover_photo_url",
                                "slug",
                            ],
                        },
                    ],
                },
            ],
        });
        const userInfo = await User.findByPk(user_id, {
            attributes: ["username", "profile_picture_url", "full_name"],
        });
        const subscribedCommunities = allSubscriptions.map((element) => {
            const community = element.community;
            const artist = community?.artist;
            return {
                id: element.community_id,
                name: community?.name,
                description: community?.description,
                artist_name: artist?.artist_name,
                artist_profile_picture_url: artist?.profile_picture_url,
                artist_cover_photo_url: artist?.cover_photo_url,
                artist_slug: artist?.slug,
            } satisfies communityDataFromAPI;
        });
        return NextResponse.json(
            {
                status: "SUCCESS",
                communities: subscribedCommunities,
                user: userInfo,
            },
            { status: 200 },
        );
    } catch (err) {
        console.error("Error fetching subscription data: ", err);
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: "Unknown Error" }, { status: 500 });
    }
}
export async function POST(request: NextRequest) {
    try {
        await connectionTestingAndHelper();
        const body = await request.json();
        const {
            auto_renew,
            community_id,
            created_at,
            end_date,
            is_active,
            payment_id,
            start_date,
            updated_at,
            user_id,
        } = body;
        if (!user_id) {
            return NextResponse.json(
                { error: "User id is invalid!" },
                { status: 400 },
            );
        }

        // Prevent artist from subscribing to their own community
        const community = await Community.findByPk(community_id);
        if (community) {
            const artist = await Artist.findOne({ where: { artist_id: community.get("artist_id") } });
            if (artist && artist.user_id === user_id) {
                return NextResponse.json(
                    { error: "You cannot subscribe to your own community!" },
                    { status: 400 },
                );
            }
        }

        let subscription = await CommunitySubscription.findOne({
            where: { user_id, community_id },
        });
        if (subscription) {
            return NextResponse.json(
                { error: "User is already subscribed to this community!" },
                { status: 400 },
            );
        }
        subscription = await CommunitySubscription.create({
            community_id,
            end_date,
            start_date,
            user_id,
            auto_renew,
            created_at,
            is_active,
            payment_id,
            updated_at,
        });
        if (!subscription) {
            return NextResponse.json(
                { error: "Failed to create a new community subscription" },
                { status: 400 },
            );
        }
        const subData = subscription.get({ plain: true });
        return NextResponse.json({ subscription: subData });
    } catch (err) {
        console.error("❌ Error updating subscription:", err);
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: "Unknown error" }, { status: 500 });
    }
}
