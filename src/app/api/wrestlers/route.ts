import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Wrestler } from "@/models";

export async function GET() {
  try {
    await connectDB();
    const wrestlers = await Wrestler.find().sort({ name: 1 });
    return NextResponse.json(wrestlers);
  } catch (error) {
    console.error("GET /api/wrestlers error:", error);
    return NextResponse.json(
      { error: "Бөхүүдийг ачаалахад алдаа гарлаа" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const wrestler = await Wrestler.create(body);
    return NextResponse.json(wrestler, { status: 201 });
  } catch (error) {
    console.error("POST /api/wrestlers error:", error);
    return NextResponse.json(
      { error: "Бөх нэмэхэд алдаа гарлаа" },
      { status: 500 },
    );
  }
}
