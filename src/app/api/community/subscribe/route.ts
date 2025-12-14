import Community from "@/models/Community";
import CommunitySubscription from "@/models/CommunitySubscription";
import { connectionTestingAndHelper } from "@/utils/dbConnection";
import { NextRequest, NextResponse } from "next/server";
export async function GET(request: NextRequest) {
    try {
        await connectionTestingAndHelper();
        const searchParams = request.nextUrl.searchParams;
        const community_id = searchParams.get("community_id");
        const user_id = searchParams.get("user_id");
        if (!user_id) {
            return NextResponse.json(
                { error: "Ids not found!!!!" },
                { status: 400 }
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
                        status: "Success",
                        message: "Subscription found",
                        subscribed: true,
                    },
                    { status: 200 }
                );
            }
            return NextResponse.json(
                {
                    status: "Success",
                    message: "Subscription not found",
                    subscribed: false,
                },
                { status: 200 }
            );
        }
        // IN GENERAL TO GET ALL THE SUBSCRIPTIONS FOR A USER.
        const allSubscriptions = await CommunitySubscription.findAll({
            where: { user_id },
            include: [
                {
                    model: Community,
                    attributes: ["name", "description"],
                },
            ],
        });
        return NextResponse.json(
            {
                status: "Success",
                count: allSubscriptions.length,
                subscriptions: allSubscriptions,
            },
            { status: 200 }
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
                { status: 400 }
            );
        }
        let subscription = await CommunitySubscription.findOne({
            where: { user_id, community_id },
        });
        if (subscription) {
            return NextResponse.json(
                { error: "User is already subscribed to this community!" },
                { status: 400 }
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
                { status: 400 }
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
