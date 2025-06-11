// import { NextResponse } from 'next/server';

// export const dynamic = 'force-dynamic';

// export async function GET(request: Request) {
//   try {

//     //Extracting the user from cookies
//     const cookies = request.headers.get('cookie');
//     const userCookie = cookies?.split(';')
//       .find(c => c.trim().startsWith('user='))
//       ?.split('=')[1];

//     if (!userCookie) {
//       return NextResponse.json({ user: null });
//     }

//     const user = JSON.parse(decodeURIComponent(userCookie));
//     return NextResponse.json({ user });
//   } catch (error) {
//     console.error('Session check error:', error);
//     return NextResponse.json({ user: null });
//   }
// } 

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { User } from "@/models/User";
import { connectionTestingAndHelper } from "@/utils/temp";

export async function GET() {
  try{
    await connectionTestingAndHelper();

    const token = (await cookies()).get("token")?.value;
    if(!token) return NextResponse.json({user:null});

    const decode = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await User.findOne({where: {user_id: decode.id}});

    if(!user) return NextResponse.json({user:null});

    return NextResponse.json({
      user: {
        id: user.user_id,
        name: user.full_name,
        email: user.email,
        provider: "local",
      },
    });
  }catch(error){
    console.error("Session check error:", error);
    return NextResponse.json({user:null});
  }
}