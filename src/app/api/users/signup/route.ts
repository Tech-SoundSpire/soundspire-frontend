import { connectionTestingAndHelper } from "@/utils/temp";
import { User } from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { sendEmail } from "@/utils/mailer";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  try {
    await connectionTestingAndHelper();
    const reqBody = await request.json(); //getting all the parameter in the body we don't need middleware here

    //things we need
    const {
      username,
      email,
      password_hash,
      full_name,
      gender,
      mobile_number,
      date_of_birth,
      city,
    } = reqBody; //taking what is needed

    console.log(reqBody);

    /***********Validation****************/

    //getting the email from the database
    console.log("🔍 Checking for existing user...");

    const existingUser = await User.findOne({ where: { email } });

    //Checking if user already exists
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists!",
          redirect: "/login",
         },
        { status: 400 }
      );
    }

    //Hashing password
    console.log("🔐 Hashing password...");

    // const salt = await bcryptjs.genSalt(10);
    const salt = 10;
    const hashedPassword = await bcryptjs.hash(password_hash, salt);

    //Creating new User
    console.log("🧑‍💻 Creating new user...");

    //If password is authenticated creating the token
    const tokenPayload = {
      //token data created
      username,
      email,
      full_name,
      password_hash: hashedPassword,
      gender,
      mobile_number,
      date_of_birth,
      city,
    };
    //creating the signed token
    const token = await jwt.sign(tokenPayload, process.env.JWT_SECRET!, {
      expiresIn: "20m",
    });

    //verification Link
    const verificationUrl = `${process.env.DOMAIN}/verifyemail?token=${token}`;

    //Sending verification email
    console.log("📨 Sending verification email...");

    await sendEmail({
      email,
      emailType: "VERIFY",
      // userId: newUser.user_id,
      link: verificationUrl,
    }).catch((err) => {
      console.log("Email send failed!!", err);
    });
    console.log(" Email sent!");

    return NextResponse.json({
      message: "Verification email sent. Please check your inbox.",
      success: true,
    });
  } catch (error: unknown) {
    if(error instanceof Error){
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    // console.error("Signup error:", error);

  }
}
