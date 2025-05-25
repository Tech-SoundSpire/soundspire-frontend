// Testing connection with databse
import { establishConnection } from "@/lib/dbConfig";
import { initSchemas } from "@/lib/initSchemas";
import { NextResponse } from "next/server";
export async function GET() {
  try {
    await establishConnection();
    await initSchemas();
    return NextResponse.json({ success: true, message: "DB connected!" });

  } catch (error) {

    return NextResponse.json(
      { success: false, message: "DB connection failed!" },
      { status: 500 }
    );
   
  }
}
