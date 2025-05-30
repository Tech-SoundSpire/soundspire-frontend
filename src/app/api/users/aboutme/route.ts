import { connectionTestingAndHelper } from "@/utils/temp";
import { User } from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import { getDataFromToken } from "@/utils/getDataFromToken";

export async function POST(request: NextRequest) {
  try {
    await connectionTestingAndHelper();

    //extracting data from the token
    const userId = await getDataFromToken(request);

    console.log("user id-"+userId);

    const user = await User.findOne({
      where: {
        user_id: userId,
      },
      attributes: {
        exclude: ["password_hash","verifyToken"],
      },
    });

    console.log("user - "+user);

    //Checking if the user exists
    if (!user) {
      return NextResponse.json(
        { error: "User does not exists" },
        { status: 400 }
      );
    }

    //if exists
    return NextResponse.json({
      message: "User found",
      data: user,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
