import { NextRequest, NextResponse } from "next/server";
import { connectionTestingAndHelper } from "@/utils/dbConnection";
import CommunitySubscription from "@/models/CommunitySubscription";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ communityId: string }> }
) {
  try {
    await connectionTestingAndHelper();
    
    const { communityId } = await params;
    
    const count = await CommunitySubscription.count({
      where: {
        community_id: communityId,
        is_active: true
      }
    });
    
    return NextResponse.json({ count });
  } catch (error: any) {
    console.error("Error fetching subscriber count:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch subscriber count" },
      { status: 500 }
    );
  }
}
