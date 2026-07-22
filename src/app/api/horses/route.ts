import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Horse } from "@/models";

export async function GET() {
  try {
    await connectDB();
    const horses = await Horse.find()
      .sort({ place: 1, order: 1, name: 1 })
      .lean();
    return NextResponse.json(horses);
  } catch (error) {
    console.error("GET /api/horses error:", error);
    return NextResponse.json(
      { error: "Морьдыг ачаалахад алдаа гарлаа" },
      { status: 500 }
    );
  }
}
