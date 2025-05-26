import { connectionTestingAndHelper } from "@/utils/temp";
import { User } from "@/models/User";
import {NextRequest, NextResponse } from 'next/server';
import bcryptjs from "bcryptjs";
import { sendEmail } from "@/utils/mailer";


export async function POST(request: NextRequest){
  try {
    await connectionTestingAndHelper();
    const reqBody = await request.json();//getting all the parameter in the body we don't need middleware here

    //things we need
    const { username, email, password_hash, full_name, gender, mobile_number } = reqBody; //taking what is needed
    console.log(reqBody);

    /***********Validation****************/

    //getting the email from the database
    console.log("🔍 Checking for existing user...");

    const existingUser = await User.findOne({ where: { email } });
    
    //Checking if user already exists
    if(existingUser) {
      return NextResponse.json({error: "User already exists!"}, {status:400})
    }

    //Hashing password
    console.log("🔐 Hashing password...");

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password_hash,salt);

    //Creating new User
    console.log("🧑‍💻 Creating new user...");

    const newUser = await User.create({
      username,
      email,
      password_hash: hashedPassword,
      full_name,
      gender,
      mobile_number
    });

    console.log("✅ New user created:", newUser.toJSON());

    //Sending verification email
    console.log("📨 Sending verification email...");

    await sendEmail({
      email,
      emailType: "VERIFY",
      userId: newUser.user_id,
    });
    console.log("✅ Email sent!");


    return NextResponse.json({
      message: "User registered successfully",
      success: true,
      newUser
    })

  } catch (error: any) {
    return NextResponse.json({error: error.message},{status: 500})
    
  }
}
