import { NextRequest } from "next/server";
import  jwt  from "jsonwebtoken";

export const getDataFromToken = (request: NextRequest) => {
  try{ 
    //Getting the data from the database using the cookies
    const token = request.cookies.get("token")?.value || "";

    // decoding the token
   const decodedToken: any = jwt.verify(token, process.env.JWT_SECRET!);
   return decodedToken.id;

  }catch(error: any){
    throw new Error(error.message);

  }
}