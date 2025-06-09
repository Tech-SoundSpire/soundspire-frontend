import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "@/models/User";
import toast from "react-hot-toast";

export async function POST(req: Request){
  const {token, password} = await req.json();
  try {
    const payload = jwt.verify(token,process.env.JWT_SECRET!) as { id: number };
    const user = await User.findByPk(payload.id);

    if(!user){
      return NextResponse.json({message: "Invalid User"}, {status:404});
    }
    
    const hash = await bcrypt.hash(password,10);
    user.password_hash = hash;
    await user.save();

    return NextResponse.json({ message: "Password updated successfully." });

  } catch (error: any) {
    return NextResponse.json({message: "Invalid or expired token."},{status:400});
    
  }
}