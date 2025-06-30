
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { User } from "@/models/User";
import { connectionTestingAndHelper } from "@/utils/temp";


interface DecodedToken{
  id: string;
}
export async function GET() {
  try{
    await connectionTestingAndHelper();

    const cookieStore = cookies();//getting the cookies
    const token = (await cookieStore).get("token")?.value;//getting the token cookies
    const userCookie = (await cookieStore).get("user")?.value;//getting teh user cookies

    if(token){
      const decode = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
      const user = await User.findOne({ where: { user_id: decode.id } });
      if (!user) return NextResponse.json({ user: null });
      return NextResponse.json({
        user: {
          id: user.user_id,
          name: user.full_name,
          email: user.email,
          provider: "local",

          displayName: user.full_name,
    photoURL: user.profile_picture_url,
    is_verified: user.is_verified,
    spotifyLinked: user.spotify_linked
        },
      });
    }

 if (userCookie) {
      const user = JSON.parse(userCookie);
      return NextResponse.json({ user });
    }

    return NextResponse.json({ user: null });

    
  }catch(error){
    console.error("Session check error:", error);
    return NextResponse.json({user:null});
  }
}