// Testing connection with databse 
import { NextResponse } from 'next/server';
import { sequelize } from '../../../lib/db';
import { initSchemas } from '@/lib/initSchemas';
export async function GET() {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
    await initSchemas();
    return NextResponse.json({ success: true, message: "DB connected!" });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    return NextResponse.json({ success: false, message: "DB connection failed!" }, { status: 500 });
  }
}


