import { NextRequest, NextResponse } from "next/server";
import { connectionTestingAndHelper } from "@/utils/temp";
import Languages from "@/models/Languages";

export async function GET(request: NextRequest) {
  try {
    await connectionTestingAndHelper();
    
    // Get all available languages
    const languages = await Languages.findAll({
      order: [['name', 'ASC']]
    });

    return NextResponse.json({
      languages: languages.map(lang => lang.toJSON())
    });

  } catch (error) {
    console.error("Error fetching languages:", error);
    return NextResponse.json(
      { error: "Failed to fetch languages" },
      { status: 500 }
    );
  }
}
