import { connectionTestingAndHelper } from "@/utils/temp";
import { User } from "@/models/User";
import {NextRequest, NextResponse } from 'next/server';
import { Op } from "sequelize";
import jwt from 'jsonwebtoken';


// export async function POST(request: NextRequest){
//   try {
//    await connectionTestingAndHelper();
//    const reqBody = await request.json();
//    const {token} = reqBody;
//    console.log("Token value"+token);
   
//    console.log("Type of token "+typeof token);

//    if (!token || typeof token !== 'string') {
//     return NextResponse.json({ error: "Invalid token format" }, { status: 400 });
//   }
  

//    //finding and validating the token value
//   const user = await User.findOne({
//       where:{
//       verifyToken: token,
//       verifyTokenExpiry: {
//        [Op.gt]: new Date(),
//       },
//     },
//   });

//   //Checking if the user exist or not
//   if(!user){
//     return NextResponse.json({error: "Invalid or expired token"},
//       {status:401}
//     )
//   }
//   console.log(user);


// if (user.isVerified) {
//   return NextResponse.json({ message: "Email already verified" }, { status: 200 });
// }

//   //Changing the database after verifications
//   user.isVerified = true;
//   user.verifyToken = undefined;
//   user.verifyTokenExpiry = undefined;

//  await user.save();
//  return NextResponse.json({message: "Email verified Successfully!",
//   success: true
//  },
//   {status:202}
// )
  
//  } catch (error: any) {
//   return NextResponse.json({error: error.message},
//     {status:500}
//   )
  
//  }

// }

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');
    if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    await connectionTestingAndHelper();

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email: decoded.email } });
    if (existingUser) {
      console.log("User Exists");
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // Create user in DB
    const newUser = await User.create({
      username: decoded.username,
      email: decoded.email,
      password_hash: decoded.password_hash,
      full_name: decoded.full_name,
      gender: decoded.gender,
      mobile_number: decoded.mobile_number,
      date_of_birth: decoded.date_of_birth,
      city: decoded.city,
      isVerified: true
    });

    console.log("Email verified and Account created")
    return NextResponse.json({ message: 'Email verified and account created', success: true });

  } catch (error: any) {
    console.error('Verification error:', error);
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
  }
}