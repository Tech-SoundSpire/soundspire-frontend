import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "@/models/User";
import { UserVerification } from "@/models/UserVerification";

export async function POST(req: Request){
  const {token, password} = await req.json();
  try {
    const payload = jwt.verify(token,process.env.JWT_SECRET!) as { id: number };
    const user = await User.findByPk(payload.id);

    if(!user){
      return NextResponse.json({message: "Invalid User"}, {status:404});
    }
    
    await UserVerification.create({
            user_id: user.user_id,
            verification_type: "Reset Password",
            is_used: true,
            verification_token: token,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 
          });
    
    const hash = await bcrypt.hash(password,10);
    user.password_hash = hash;
    await user.save();

    return NextResponse.json({ message: "Password updated successfully." });

  } catch (error: unknown) {
    if(error instanceof Error)
    return NextResponse.json({message: "Invalid or expired token."},{status:400});
    
  }
}