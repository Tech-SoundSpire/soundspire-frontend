// import { connectionTestingAndHelper } from "@/utils/temp";
import { NextRequest, NextResponse } from "next/server";

export async function GET( request: NextRequest) {
  try {
    // await connectionTestingAndHelper();
    const response = NextResponse.redirect(new URL("/login", request.url));

    //removing the token data and cookies
    response.cookies.set("token", "", {
      httpOnly: true,
      expires: new Date(0),
      path: '/',
      sameSite: "lax"
    });
    //clearing the user cookie
    response.cookies.set("user", "", {
      httpOnly: true,
      expires: new Date(0),
      path: '/',
      sameSite: "lax"
    });

    return response;
  } catch (error: unknown) {
    if(error instanceof Error){
      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 500 }
      );
    }
  }
}
