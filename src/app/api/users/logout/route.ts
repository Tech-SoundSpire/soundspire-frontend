import { connectionTestingAndHelper } from "@/utils/temp";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await connectionTestingAndHelper();
    const response = NextResponse.json({
      message: "Logout Successfully",
      success: true,
    });

    //removing the token data and cookies
    response.cookies.set("token", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 }
    );
  }
}
