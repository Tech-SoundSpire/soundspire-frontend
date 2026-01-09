import { NextRequest } from "next/server";
import  jwt  from "jsonwebtoken";


interface DecodedToken {
  id: string;
}
export const getDataFromToken = (request: NextRequest) => {
  try{ 
    //Getting the data from the database using the cookies
    const token = request.cookies.get("token")?.value || "";

    // decoding the token
   const decodedToken= jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
   return decodedToken.id; // Return just the id string (original behavior)

  }catch(error: unknown){
    if(error instanceof Error)
    throw new Error(error.message);

  }
}
