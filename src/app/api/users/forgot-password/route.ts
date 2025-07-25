import { NextResponse } from "next/server";
import { User } from "@/models/User";
import  jwt  from "jsonwebtoken";
import { sendEmail } from "@/utils/mailer";

export async function POST(req: Request) {
  try{
    const {email} = await req.json();
    const user = await User.findOne({where:{email}});

    if(!user){
      return NextResponse.json({message:"User not found"},{status:400});
    }

    //Generating token for password reset
    const token = jwt.sign({id: user.user_id}, process.env.JWT_SECRET!,{
      expiresIn: "20m"
    });

    const resetLink = `${process.env.DOMAIN}/reset-password?token=${token}`;

    // calling email sender
    await sendEmail({
      email,
      emailType: "RESET",
      link: resetLink,
    });

    return NextResponse.json({
      message: "Reset password link has been sent to your email.",
    });


  }catch(error: unknown){
    if(error instanceof Error){

      console.log("Forgot password Error:", error.message);
      return NextResponse.json({message: error.message},{status:500});
    }

  }
}