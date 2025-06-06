import { connectionTestingAndHelper } from "@/utils/temp";
import { User } from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import toast from "react-hot-toast";

export async function POST(request: NextRequest) {
  try {
    await connectionTestingAndHelper();
    const reqBody = await request.json(); //getting all the parameter in the body we don't need middleware here

    //things we need
    const { email, password_hash } = reqBody; //taking what is needed

    //validation
    console.log(reqBody);

    //Getting the user
    const user = await User.findOne({
      where: {
        email,
      },
    });

    //Checking if the user exists
    if (!user) {
      toast.error("User not exists Please Sign in!");
      return NextResponse.json(
        { error: "User does not exists" },
        { status: 400 }
      );
    }
    console.log("User Exists");

    //Checking the password
    const validPassword = await bcryptjs.compare(
      password_hash,
      user.password_hash
    );

    if (!validPassword) {
      toast.error("Incorrect password!");
      return NextResponse.json(
        { error: "Check your password or password is wrong!" },
        { status: 400 }
      );
    }
    console.log("password validated");

    //creating response
    const response = NextResponse.json({
      message: "Logged In Success",
      success: true,
    });

    return response; //seding response and user is loggedin
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
