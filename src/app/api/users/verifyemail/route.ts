import { connectionTestingAndHelper } from "@/utils/temp";
import { User } from "@/models/User";
import {NextRequest, NextResponse } from 'next/server';
import { Op } from "sequelize";


export async function POST(request: NextRequest){
  try {
   await connectionTestingAndHelper();
   const reqBody = await request.json();
   const {token} = reqBody;
   console.log("Token value"+token);
   
   console.log("Type of token "+typeof token);

   if (!token || typeof token !== 'string') {
    return NextResponse.json({ error: "Invalid token format" }, { status: 400 });
  }
  

   //finding and validating the token value
  const user = await User.findOne({
      where:{
      verifyToken: token,
      verifyTokenExpiry: {
       [Op.gt]: new Date(),
      },
    },
  });

  //Checking if the user exist or not
  if(!user){
    return NextResponse.json({error: "Invalid or expired token"},
      {status:401}
    )
  }
  console.log(user);


if (user.isVerified) {
  return NextResponse.json({ message: "Email already verified" }, { status: 200 });
}

  //Changing the database after verifications
  user.isVerified = true;
  user.verifyToken = undefined;
  user.verifyTokenExpiry = undefined;

 await user.save();
 return NextResponse.json({message: "Email verified Successfully!",
  success: true
 },
  {status:202}
)
  
 } catch (error: any) {
  return NextResponse.json({error: error.message},
    {status:500}
  )
  
 }

}